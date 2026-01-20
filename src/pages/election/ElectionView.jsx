import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaShare,
  FaCalendar,
  FaClock,
  FaGlobe,
  FaUsers,
  FaDollarSign,
  FaVoteYea,
  FaEye,
  FaImage,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaTrophy,
  FaMapMarkerAlt,
  FaBuilding,
  FaPlayCircle,
} from 'react-icons/fa';

import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
import { setCurrentElection } from '../../redux/slices/electionSlice';
import SimilarElections from '../../components/ai/SimilarElections';

export default function ElectionView() {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [election, setElection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);

  // Check where user came from
  const source = location.state?.source || 'all-elections';
  const isFromMyElections = source === 'my-elections';

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.userId || parsed.user_id || parsed.id || null;
      }
      const userId = localStorage.getItem('userId');
      return userId ? parseInt(userId) : null;
      /*eslint-disable*/
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwner = election && currentUserId && String(election.creator_id) === String(currentUserId);
  const hasActiveVotes = election && (election.vote_count > 0 || election.status === 'active');
  
  const showEditDeleteButtons = isFromMyElections && isOwner;
  const canModify = showEditDeleteButtons && !hasActiveVotes;
  
  const backPath = isFromMyElections ? '/dashboard/my-elections' : '/dashboard/all-elections';
  const backLabel = isFromMyElections ? 'Back to My Elections' : 'Back to All Elections';

  useEffect(() => {
    fetchElectionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      
      const electionResponse = await getElection(id);
      console.log('✅ Election response:', electionResponse);
      
      const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
      setElection(electionData);
      
      dispatch(setCurrentElection({
        ...electionData,
        currentStep: 4,
        completedSteps: [1, 2, 3, 4],
      }));
      
      if (electionData.questions && Array.isArray(electionData.questions)) {
        console.log('✅ Using questions from election response:', electionData.questions.length);
        setQuestions(electionData.questions);
      } else {
        try {
          const questionsResponse = await getElectionQuestions(id);
          const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
          console.log('✅ Fetched questions separately:', questionsData.length);
          setQuestions(questionsData);
        } catch (err) {
          console.log('❌ Questions not available:', err);
          setQuestions([]);
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching election:', error);
      toast.error('Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canModify) {
      toast.error('You cannot delete this election');
      return;
    }
    try {
      await deleteElection(id);
      toast.success('Election deleted successfully');
      navigate('/dashboard/my-elections');
     /*eslint-disable*/
    } catch (error) {
      toast.error('Failed to delete election');
    }
  };

  const handleShare = () => {
    const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusBadge = (status) => {
    const configs = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaClock },
      published: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
      completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaCheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
    };
    return configs[status?.toLowerCase()] || configs.draft;
  };

  // ✅ FIX: renderVideoPlayer function INSIDE the component
  const renderVideoPlayer = (videoUrl) => {
    if (!videoUrl) return null;
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      
      if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        return (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Election Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }
    
    return (
      <video
        controls
        className="w-full rounded-lg"
        src={videoUrl}
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  // Helper function to render regional pricing tooltip content
  const renderRegionalPricingTooltip = () => {
    if (election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0) {
      return (
        <div className="space-y-1">
          {election.regional_pricing.slice(0, 5).map((region, idx) => (
            <div key={idx} className="flex justify-between gap-3">
              <span>{region.region_name}</span>
              <span className="text-green-300 font-semibold">${parseFloat(region.participation_fee).toFixed(2)}</span>
            </div>
          ))}
          {election.regional_pricing.length > 5 && (
            <div className="text-gray-400 text-center pt-1">+{election.regional_pricing.length - 5} more</div>
          )}
        </div>
      );
    }
    return (
      <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
    );
  };

  // Helper function to get fee display value
  const getFeeDisplayValue = () => {
    if (election.is_free) return 'Free';
    if (election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0) {
      const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
      const min = Math.min(...fees);
      const max = Math.max(...fees);
      return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
    }
    return `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`;
  };

  // Helper function to get pricing type label
  const getPricingTypeLabel = () => {
    if (election.pricing_type === 'regional_fee') return '🌍 Regional Pricing';
    if (election.pricing_type === 'general_fee') return '💵 Fixed Fee';
    return 'Paid Election';
  };

  // Helper function to get fee type suffix
  const getFeeTypeSuffix = () => {
    if (election.pricing_type === 'regional_fee') return '(Regional)';
    if (election.pricing_type === 'general_fee') return '(Fixed)';
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
          <button
            onClick={() => navigate('/dashboard/all-elections')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusBadge(election.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6">
          <button
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaArrowLeft /> {backLabel}
          </button>

          {/* View Only Mode Banner */}
          {!isFromMyElections && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-2">
                <FaEye className="text-blue-600" />
                <span className="text-blue-800 font-medium">View Only Mode</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                To edit or delete, go to{' '}
                <button 
                  onClick={() => navigate('/dashboard/my-elections')} 
                  className="underline font-semibold"
                >
                  My Elections
                </button>
              </p>
            </div>
          )}

          {/* Election Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
                    <StatusIcon className="text-xs" />
                    {election.status}
                  </span>
                </div>
                <p className="text-gray-600">{election.description}</p>
                
                {/* Ownership indicator */}
                {isOwner && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <FaCheckCircle /> You own this election
                  </div>
                )}
                
                {/* Active votes warning */}
                {showEditDeleteButtons && hasActiveVotes && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    <FaLock /> Cannot modify - has active votes
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {showEditDeleteButtons && (
                  <button
                    onClick={() => canModify && navigate(`/dashboard/create-election?edit=${election.id}`)}
                    disabled={!canModify}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      canModify
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={hasActiveVotes ? 'Cannot modify - has active votes' : 'Edit this election'}
                  >
                    <FaEdit /> Edit
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaShare /> Share
                </button>
                
                {showEditDeleteButtons && (
                  <button
                    onClick={() => canModify && setDeleteModal(true)}
                    disabled={!canModify}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      canModify
                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={hasActiveVotes ? 'Cannot modify - has active votes' : 'Delete this election'}
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
                  <FaVoteYea />
                  {election.vote_count || 0}
                </div>
                <p className="text-sm text-gray-600">Votes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
                  <FaEye />
                  {election.view_count || 0}
                </div>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
                  <FaUsers />
                  {questions.length || 0}
                </div>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1 relative group">
                  <FaDollarSign />
                  {getFeeDisplayValue()}
                  
                  {!election.is_free && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1 text-orange-300">
                          {getPricingTypeLabel()}
                        </div>
                        {renderRegionalPricingTooltip()}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-8 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Fee {getFeeTypeSuffix()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['overview', 'media', 'questions', 'settings', 'gamify'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCalendar className="text-blue-600" />
                  Schedule
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{formatDate(election.start_date)}</p>
                    {election.start_time && (
                      <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{formatDate(election.end_date)}</p>
                    {election.end_time && (
                      <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Timezone</p>
                    <p className="font-medium">{election.timezone || 'UTC'}</p>
                  </div>
                </div>
              </div>

              {/* Voting Configuration Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaVoteYea className="text-purple-600" />
                  Voting Configuration
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Voting Type</p>
                    <p className="font-medium capitalize">{election.voting_type || 'Plurality'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Live Results</p>
                    <p className="font-medium flex items-center gap-2">
                      {election.show_live_results ? (
                        <><FaCheckCircle className="text-green-600" /> Enabled</>
                      ) : (
                        <><FaTimesCircle className="text-red-600" /> Disabled</>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vote Editing</p>
                    <p className="font-medium flex items-center gap-2">
                      {election.vote_editing_allowed ? (
                        <><FaCheckCircle className="text-green-600" /> Allowed</>
                      ) : (
                        <><FaTimesCircle className="text-red-600" /> Not Allowed</>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Biometric Required</p>
                    <p className="font-medium flex items-center gap-2">
                      {election.biometric_required ? (
                        <><FaLock className="text-orange-600" /> Yes</>
                      ) : (
                        <><FaUnlock className="text-green-600" /> No</>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Anonymous Voting</p>
                    <p className="font-medium flex items-center gap-2">
                      {election.anonymous_voting_enabled ? (
                        <><FaCheckCircle className="text-green-600" /> Enabled</>
                      ) : (
                        <><FaTimesCircle className="text-red-600" /> Disabled</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Access Control Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaGlobe className="text-green-600" />
                  Access Control
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Permission Type</p>
                    <p className="font-medium capitalize">{election.permission_type?.replace('_', ' ') || 'Public'}</p>
                  </div>
                  {election.allowed_countries && election.allowed_countries.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Allowed Countries ({election.allowed_countries.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {election.allowed_countries.map((country, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Allowed Countries</p>
                      <p className="font-medium">All Countries</p>
                    </div>
                  )}
                  {election.authentication_methods && election.authentication_methods.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Authentication Methods</p>
                      <div className="flex flex-wrap gap-2">
                        {election.authentication_methods.map((method, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded capitalize">
                            {method.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaDollarSign className="text-yellow-600" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium capitalize">
                      {election.is_free ? 'Free' : (election.pricing_type?.replace('_', ' ') || 'Paid')}
                    </p>
                  </div>
                  {!election.is_free && (
                    <>
                      {election.pricing_type === 'regional_fee' && election.regional_pricing && election.regional_pricing.length > 0 ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Regional Pricing</p>
                          <div className="space-y-2">
                            {election.regional_pricing.map((region, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">{region.region_name}</span>
                                <span className="font-semibold text-green-600">
                                  ${parseFloat(region.participation_fee).toFixed(2)} {region.currency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">Participation Fee</p>
                          <p className="font-medium text-2xl text-green-600">
                            ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {election.processing_fee_percentage > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Processing Fee</p>
                          <p className="font-medium">{election.processing_fee_percentage}%</p>
                        </div>
                      )}
                      {election.prize_pool && parseFloat(election.prize_pool) > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Prize Pool</p>
                          <p className="font-medium text-lg text-purple-600">
                            ${parseFloat(election.prize_pool).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Video Watch Requirements Card */}
              {(election.video_watch_required || 
                election.required_watch_duration_minutes > 0 || 
                (election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0) ||
                election.minimum_watch_time > 0) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaPlayCircle className="text-red-600" />
                    Video Watch Requirements
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Video Watch Required</p>
                      <p className="font-medium flex items-center gap-2">
                        {election.video_watch_required ? (
                          <><FaCheckCircle className="text-green-600" /> Yes</>
                        ) : (
                          <><FaTimesCircle className="text-red-600" /> No</>
                        )}
                      </p>
                    </div>
                    {election.required_watch_duration_minutes > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Required Watch Duration</p>
                        <p className="font-medium">{election.required_watch_duration_minutes} minutes</p>
                      </div>
                    )}
                    {election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Minimum Watch Percentage</p>
                        <p className="font-medium">{parseFloat(election.minimum_watch_percentage).toFixed(2)}%</p>
                      </div>
                    )}
                    {election.minimum_watch_time > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Minimum Watch Time</p>
                        <p className="font-medium">{election.minimum_watch_time} seconds</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Creator Information Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaBuilding className="text-indigo-600" />
                  Creator Information 
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Creator Type</p>
                    <p className="font-medium capitalize">{election.creator_type || 'Individual'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Creator ID</p>
                    <p className="font-medium">
                      {election.creator_id}
                      {isOwner && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">You</span>
                      )}
                    </p>
                  </div>
                  {election.organization_id && (
                    <div>
                      <p className="text-sm text-gray-600">Organization ID</p>
                      <p className="font-medium">{election.organization_id}</p>
                    </div>
                  )}
                  {election.category_id && (
                    <div>
                      <p className="text-sm text-gray-600">Category ID</p>
                      <p className="font-medium">{election.category_id}</p>
                    </div>
                  )}
                  {election.subscription_plan_id && (
                    <div>
                      <p className="text-sm text-gray-600">Subscription Plan ID</p>
                      <p className="font-medium">{election.subscription_plan_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
                  </div>
                  {election.updated_at && (
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium text-sm">{formatDate(election.updated_at)}</p>
                    </div>
                  )}
                  {election.published_at && (
                    <div>
                      <p className="text-sm text-gray-600">Published At</p>
                      <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* URLs & Links Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaShare className="text-pink-600" />
                  URLs & Links 
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Slug</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.slug}</p>
                  </div>
                  {election.custom_url && (
                    <div>
                      <p className="text-sm text-gray-600">Custom URL</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.custom_url}</p>
                    </div>
                  )}
                  {election.shareable_url && (
                    <div>
                      <p className="text-sm text-gray-600">Shareable URL</p>
                      <a
                        href={election.shareable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all block"
                      >
                        {election.shareable_url}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Public Link</p>
                    <a
                      href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all block"
                    >
                      {`https://prod-client-omega.vercel.app/vote/${election.slug}`}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {election.topic_image_url && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaImage className="text-blue-600" />
                    Topic Image
                  </h3>
                  <img
                    src={election.topic_image_url}
                    alt={election.title}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}

              {(election.topic_video_url || election.video_url) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaVideo className="text-red-600" />
                    Topic Video
                  </h3>
                  {renderVideoPlayer(election.topic_video_url || election.video_url)}
                </div>
              )}

              {election.logo_url && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaImage className="text-purple-600" />
                    Election Logo
                  </h3>
                  <img
                    src={election.logo_url}
                    alt="Logo"
                    className="max-h-48 object-contain"
                  />
                </div>
              )}

              {election.voting_body_content && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Voting Body Content
                  </h3>
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: election.voting_body_content }} 
                  />
                </div>
              )}

              {!election.topic_image_url && !election.topic_video_url && !election.video_url && !election.logo_url && !election.voting_body_content && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No media files uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map((question, idx) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          {question.question_text}
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
                            {question.question_type}
                          </span>
                          {question.is_required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Required
                            </span>
                          )}
                          {question.max_selections > 1 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              Max: {question.max_selections}
                            </span>
                          )}
                        </div>
                        {question.question_image_url && (
                          <img
                            src={question.question_image_url}
                            alt="Question"
                            className="max-h-48 object-contain mb-3 rounded"
                          />
                        )}
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Options:</p>
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <span className="flex-1">{option.option_text}</span>
                                {option.option_image_url && (
                                  <img 
                                    src={option.option_image_url} 
                                    alt="Option" 
                                    className="h-8 w-8 object-cover rounded" 
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <FaVoteYea className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No questions added yet</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Election Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <span className="text-gray-600">Show Live Results</span>
                  <span className="font-medium">{election.show_live_results ? 'Yes' : 'No'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <span className="text-gray-600">Vote Editing Allowed</span>
                  <span className="font-medium">{election.vote_editing_allowed ? 'Yes' : 'No'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <span className="text-gray-600">Biometric Required</span>
                  <span className="font-medium">{election.biometric_required ? 'Yes' : 'No'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <span className="text-gray-600">Anonymous Voting</span>
                  <span className="font-medium">{election.anonymous_voting_enabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <span className="text-gray-600">Video Watch Required</span>
                  <span className="font-medium">{election.video_watch_required ? 'Yes' : 'No'}</span>
                </div>
                {election.corporate_style && (
                  <div className="p-4 bg-gray-50 rounded">
                    <span className="text-gray-600 block mb-2">Corporate Style</span>
                    <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gamify Tab */}
          {activeTab === 'gamify' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-600" />
                Gamification Configuration 
              </h3>
              
              {(election.lottery_enabled || election.lottery_config?.lottery_enabled) ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                    <span className="text-gray-700 font-medium">Lottery Status</span>
                    <span className="font-bold text-green-600 flex items-center gap-2">
                      <FaCheckCircle /> Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <span className="text-gray-600">Number of Winners</span>
                    <span className="font-medium text-lg">
                      {election.lottery_winner_count || election.lottery_config?.winner_count || 1}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <span className="text-gray-600">Prize Funding Source</span>
                    <span className="font-medium capitalize">
                      {(election.lottery_prize_funding_source || election.lottery_config?.prize_funding_source || 'N/A').replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <span className="text-gray-600">Reward Type</span>
                    <span className="font-medium capitalize">
                      {(election.lottery_reward_type || election.lottery_config?.reward_type || 'N/A').replace('_', ' ')}
                    </span>
                  </div>
                  
                  {(election.lottery_estimated_value || election.lottery_config?.estimated_value) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded border border-green-200">
                      <span className="text-gray-600 font-medium">Estimated Prize Value</span>
                      <span className="font-bold text-green-600 text-xl">
                        ${parseFloat(election.lottery_estimated_value || election.lottery_config?.estimated_value).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
                      <span className="text-gray-600 font-medium">Total Prize Pool</span>
                      <span className="font-bold text-blue-600 text-xl">
                        ${parseFloat(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {(election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded border border-purple-200">
                      <span className="text-gray-600 font-medium">Revenue Share</span>
                      <span className="font-bold text-purple-600 text-lg">
                        {election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage}%
                      </span>
                    </div>
                  )}
                  
                  {(election.lottery_projected_revenue || election.lottery_config?.projected_revenue) && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded border border-indigo-200">
                      <span className="text-gray-600 font-medium">Projected Revenue</span>
                      <span className="font-bold text-indigo-600 text-xl">
                        ${parseFloat(election.lottery_projected_revenue || election.lottery_config?.projected_revenue).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {(election.lottery_prize_description || election.lottery_config?.prize_description) && (
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <span className="text-gray-700 block mb-2 font-semibold">Prize Description</span>
                      <p className="text-gray-800 leading-relaxed">
                        {election.lottery_prize_description || election.lottery_config?.prize_description}
                      </p>
                    </div>
                  )}
                  
                  {/* Prize Distribution */}
                  {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution) && 
                   (election.lottery_prize_distribution?.length > 0 || election.lottery_config?.prize_distribution?.length > 0) && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border-2 border-yellow-300">
                      <h4 className="text-gray-700 font-bold mb-3 flex items-center gap-2">
                        <FaTrophy className="text-yellow-600" />
                        Prize Distribution by Rank
                      </h4>
                      <div className="space-y-3">
                        {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution).map((prize, idx) => {
                          const getRankBgColor = (rank) => {
                            if (rank === 1) return 'bg-yellow-500';
                            if (rank === 2) return 'bg-gray-400';
                            if (rank === 3) return 'bg-orange-600';
                            return 'bg-blue-500';
                          };
                          
                          const getRankLabel = (rank) => {
                            if (rank === 1) return '🥇 First Place';
                            if (rank === 2) return '🥈 Second Place';
                            if (rank === 3) return '🥉 Third Place';
                            return `Rank ${rank}`;
                          };
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getRankBgColor(prize.rank)}`}>
                                  {prize.rank}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {getRankLabel(prize.rank)}
                                  </p>
                                  {prize.prize_description && (
                                    <p className="text-sm text-gray-600">{prize.prize_description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-green-600 text-lg">
                                  ${parseFloat(prize.prize_value || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No Gamification configured for this election</p>
                  <p className="text-sm text-gray-500 mt-2">Gamification features can be added when creating an election</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Similar Elections Section - AI Powered Recommendations */}
        <div className="mt-8">
          <SimilarElections electionId={id} />
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
              <p className="text-gray-600">
                Delete &quot;<strong>{election.title}</strong>&quot;? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//without AI it is working fine
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   FaArrowLeft,
//   FaEdit,
//   FaTrash,
//   FaShare,
//   FaCalendar,
//   FaClock,
//   FaGlobe,
//   FaUsers,
//   FaDollarSign,
//   FaVoteYea,
//   FaEye,
//   FaImage,
//   FaVideo,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaLock,
//   FaUnlock,
//   FaTrophy,
//   FaMapMarkerAlt,
//   FaBuilding,
//   FaPlayCircle,
// } from 'react-icons/fa';

// import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
// import { setCurrentElection } from '../../redux/slices/electionSlice';

// export default function ElectionView() {

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   // Check where user came from
//   const source = location.state?.source || 'all-elections';
//   const isFromMyElections = source === 'my-elections';

//   // Get current user ID from localStorage
//   const getCurrentUserId = () => {
//     try {
//       const userData = localStorage.getItem('userData');
//       if (userData) {
//         const parsed = JSON.parse(userData);
//         return parsed.userId || parsed.user_id || parsed.id || null;
//       }
//       const userId = localStorage.getItem('userId');
//       return userId ? parseInt(userId) : null;
//       /*eslint-disable*/
//     } catch (error) {
//       return null;
//     }
//   };

//   const currentUserId = getCurrentUserId();
//   const isOwner = election && currentUserId && String(election.creator_id) === String(currentUserId);
//   const hasActiveVotes = election && (election.vote_count > 0 || election.status === 'active');
  
//   // ✅ CHANGED: Show buttons only if owner AND from My Elections
//   const showEditDeleteButtons = isFromMyElections && isOwner;
//   // Can actually perform edit/delete only if no active votes
//   const canModify = showEditDeleteButtons && !hasActiveVotes;
  
//   const backPath = isFromMyElections ? '/dashboard/my-elections' : '/dashboard/all-elections';
//   const backLabel = isFromMyElections ? 'Back to My Elections' : 'Back to All Elections';

//   useEffect(() => {
//     fetchElectionDetails();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       const electionResponse = await getElection(id);
//       console.log('✅ Election response:', electionResponse);
      
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       dispatch(setCurrentElection({
//         ...electionData,
//         currentStep: 4,
//         completedSteps: [1, 2, 3, 4],
//       }));
      
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         console.log('✅ Using questions from election response:', electionData.questions.length);
//         setQuestions(electionData.questions);
//       } else {
//         try {
//           const questionsResponse = await getElectionQuestions(id);
//           const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
//           console.log('✅ Fetched questions separately:', questionsData.length);
//           setQuestions(questionsData);
//         } catch (err) {
//           console.log('❌ Questions not available:', err);
//           setQuestions([]);
//         }
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching election:', error);
//       toast.error('Failed to load election details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!canModify) {
//       toast.error('You cannot delete this election');
//       return;
//     }
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard/my-elections');
//      /*eslint-disable*/
//     } catch (error) {
//       toast.error('Failed to delete election');
//     }
//   };

//   const handleShare = () => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return 'N/A';
//     return timeString;
//   };

//   const getStatusBadge = (status) => {
//     const configs = {
//       draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaClock },
//       published: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
//       active: { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
//       completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaCheckCircle },
//       cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
//     };
//     return configs[status?.toLowerCase()] || configs.draft;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!election) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
//           <button
//             onClick={() => navigate('/dashboard/all-elections')}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusConfig = getStatusBadge(election.status);
//   const StatusIcon = statusConfig.icon;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mb-6">
//           <button
//             onClick={() => navigate(backPath)}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> {backLabel}
//           </button>

//           {/* ✅ View Only Mode Banner - Only show when NOT from My Elections */}
//           {!isFromMyElections && (
//             <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
//               <div className="flex items-center gap-2">
//                 <FaEye className="text-blue-600" />
//                 <span className="text-blue-800 font-medium">View Only Mode</span>
//               </div>
//               <p className="text-sm text-blue-600 mt-1">
//                 To edit or delete, go to <button onClick={() => navigate('/dashboard/my-elections')} className="underline font-semibold">My Elections</button>
//               </p>
//             </div>
//           )}

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
//                   <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
//                     <StatusIcon className="text-xs" />
//                     {election.status}
//                   </span>
//                 </div>
//                 <p className="text-gray-600">{election.description}</p>
                
//                 {/* Ownership indicator - only show when owner */}
//                 {isOwner && (
//                   <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
//                     <FaCheckCircle /> You own this election
//                   </div>
//                 )}
                
//                 {/* Active votes warning - only show when owner viewing from My Elections */}
//                 {showEditDeleteButtons && hasActiveVotes && (
//                   <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
//                     <FaLock /> Cannot modify - has active votes
//                   </div>
//                 )}
//               </div>
              
//               {/* ✅ CHANGED: Action Buttons - Conditionally rendered */}
//               <div className="flex gap-2">
//                 {/* Edit button - only show if owner and from My Elections */}
//                 {showEditDeleteButtons && (
//                   <button
//                     onClick={() => canModify && navigate(`/dashboard/create-election?edit=${election.id}`)}
//                     disabled={!canModify}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                       canModify
//                         ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     title={hasActiveVotes ? 'Cannot modify - has active votes' : 'Edit this election'}
//                   >
//                     <FaEdit /> Edit
//                   </button>
//                 )}
                
//                 {/* Share button - always visible */}
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
                
//                 {/* Delete button - only show if owner and from My Elections */}
//                 {showEditDeleteButtons && (
//                   <button
//                     onClick={() => canModify && setDeleteModal(true)}
//                     disabled={!canModify}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                       canModify
//                         ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     title={hasActiveVotes ? 'Cannot modify - has active votes' : 'Delete this election'}
//                   >
//                     <FaTrash /> Delete
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
//                   <FaVoteYea />
//                   {election.vote_count || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Votes</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
//                   <FaEye />
//                   {election.view_count || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Views</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
//                   <FaUsers />
//                   {questions.length || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Questions</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1 relative group">
//                   <FaDollarSign />
//                   {election.is_free ? 'Free' : 
//                     election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ?
//                       (() => {
//                         const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
//                         const min = Math.min(...fees);
//                         const max = Math.max(...fees);
//                         return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
//                       })()
//                     : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`
//                   }
                  
//                   {!election.is_free && (
//                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
//                       <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
//                         <div className="font-semibold mb-1 text-orange-300">
//                           {election.pricing_type === 'regional_fee' ? '🌍 Regional Pricing' : 
//                            election.pricing_type === 'general_fee' ? '💵 Fixed Fee' : 'Paid Election'}
//                         </div>
//                         {election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ? (
//                           <div className="space-y-1">
//                             {election.regional_pricing.slice(0, 5).map((region, idx) => (
//                               <div key={idx} className="flex justify-between gap-3">
//                                 <span>{region.region_name}</span>
//                                 <span className="text-green-300 font-semibold">${parseFloat(region.participation_fee).toFixed(2)}</span>
//                               </div>
//                             ))}
//                             {election.regional_pricing.length > 5 && (
//                               <div className="text-gray-400 text-center pt-1">+{election.regional_pricing.length - 5} more</div>
//                             )}
//                           </div>
//                         ) : (
//                           <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
//                         )}
//                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
//                           <div className="border-8 border-transparent border-t-gray-900"></div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   Fee {election.pricing_type === 'regional_fee' ? '(Regional)' : election.pricing_type === 'general_fee' ? '(Fixed)' : ''}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'gamify'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
//                   activeTab === tab
//                     ? 'border-b-2 border-blue-600 text-blue-600'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-6">
//           {activeTab === 'overview' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaCalendar className="text-blue-600" />
//                   Schedule
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Start Date</p>
//                     <p className="font-medium">{formatDate(election.start_date)}</p>
//                     {election.start_time && <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">End Date</p>
//                     <p className="font-medium">{formatDate(election.end_date)}</p>
//                     {election.end_time && <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Timezone</p>
//                     <p className="font-medium">{election.timezone || 'UTC'}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaVoteYea className="text-purple-600" />
//                   Voting Configuration
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Voting Type</p>
//                     <p className="font-medium capitalize">{election.voting_type || 'Plurality'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Live Results</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.show_live_results ? (
//                         <>
//                           <FaCheckCircle className="text-green-600" /> Enabled
//                         </>
//                       ) : (
//                         <>
//                           <FaTimesCircle className="text-red-600" /> Disabled
//                         </>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Vote Editing</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.vote_editing_allowed ? (
//                         <>
//                           <FaCheckCircle className="text-green-600" /> Allowed
//                         </>
//                       ) : (
//                         <>
//                           <FaTimesCircle className="text-red-600" /> Not Allowed
//                         </>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Biometric Required</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.biometric_required ? (
//                         <>
//                           <FaLock className="text-orange-600" /> Yes
//                         </>
//                       ) : (
//                         <>
//                           <FaUnlock className="text-green-600" /> No
//                         </>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Anonymous Voting</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.anonymous_voting_enabled ? (
//                         <>
//                           <FaCheckCircle className="text-green-600" /> Enabled
//                         </>
//                       ) : (
//                         <>
//                           <FaTimesCircle className="text-red-600" /> Disabled
//                         </>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaGlobe className="text-green-600" />
//                   Access Control
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Permission Type</p>
//                     <p className="font-medium capitalize">{election.permission_type?.replace('_', ' ') || 'Public'}</p>
//                   </div>
//                   {election.allowed_countries && election.allowed_countries.length > 0 ? (
//                     <div>
//                       <p className="text-sm text-gray-600 mb-2">Allowed Countries ({election.allowed_countries.length})</p>
//                       <div className="flex flex-wrap gap-2">
//                         {election.allowed_countries.map((country, idx) => (
//                           <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
//                             {country}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <p className="text-sm text-gray-600">Allowed Countries</p>
//                       <p className="font-medium">All Countries</p>
//                     </div>
//                   )}
//                   {election.authentication_methods && election.authentication_methods.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600 mb-2">Authentication Methods</p>
//                       <div className="flex flex-wrap gap-2">
//                         {election.authentication_methods.map((method, idx) => (
//                           <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded capitalize">
//                             {method.replace('_', ' ')}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaDollarSign className="text-yellow-600" />
//                   Pricing
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Type</p>
//                     <p className="font-medium capitalize">
//                       {election.is_free ? 'Free' : (election.pricing_type?.replace('_', ' ') || 'Paid')}
//                     </p>
//                   </div>
//                   {!election.is_free && (
//                     <>
//                       {election.pricing_type === 'regional_fee' && election.regional_pricing && election.regional_pricing.length > 0 ? (
//                         <div>
//                           <p className="text-sm text-gray-600 mb-2">Regional Pricing</p>
//                           <div className="space-y-2">
//                             {election.regional_pricing.map((region, idx) => (
//                               <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                                 <span className="text-sm">{region.region_name}</span>
//                                 <span className="font-semibold text-green-600">
//                                   ${parseFloat(region.participation_fee).toFixed(2)} {region.currency}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           <p className="text-sm text-gray-600">Participation Fee</p>
//                           <p className="font-medium text-2xl text-green-600">
//                             ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
//                           </p>
//                         </div>
//                       )}
//                       {election.processing_fee_percentage > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Processing Fee</p>
//                           <p className="font-medium">{election.processing_fee_percentage}%</p>
//                         </div>
//                       )}
//                       {election.prize_pool && parseFloat(election.prize_pool) > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Prize Pool</p>
//                           <p className="font-medium text-lg text-purple-600">
//                             ${parseFloat(election.prize_pool).toFixed(2)}
//                           </p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {(election.video_watch_required || 
//                 election.required_watch_duration_minutes > 0 || 
//                 (election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0) ||
//                 election.minimum_watch_time > 0) && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaPlayCircle className="text-red-600" />
//                     Video Watch Requirements
//                   </h3>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-sm text-gray-600">Video Watch Required</p>
//                       <p className="font-medium flex items-center gap-2">
//                         {election.video_watch_required ? (
//                           <>
//                             <FaCheckCircle className="text-green-600" /> Yes
//                           </>
//                         ) : (
//                           <>
//                             <FaTimesCircle className="text-red-600" /> No
//                           </>
//                         )}
//                       </p>
//                     </div>
//                     {election.required_watch_duration_minutes > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Required Watch Duration</p>
//                         <p className="font-medium">{election.required_watch_duration_minutes} minutes</p>
//                       </div>
//                     )}
//                     {election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Minimum Watch Percentage</p>
//                         <p className="font-medium">{parseFloat(election.minimum_watch_percentage).toFixed(2)}%</p>
//                       </div>
//                     )}
//                     {election.minimum_watch_time > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Minimum Watch Time</p>
//                         <p className="font-medium">{election.minimum_watch_time} seconds</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaBuilding className="text-indigo-600" />
//                   Creator Information 
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Creator Type</p>
//                     <p className="font-medium capitalize">{election.creator_type || 'Individual'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Creator ID</p>
//                     <p className="font-medium">
//                       {election.creator_id}
//                       {isOwner && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">You</span>}
//                     </p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   {election.category_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Category ID</p>
//                       <p className="font-medium">{election.category_id}</p>
//                     </div>
//                   )}
//                   {election.subscription_plan_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Subscription Plan ID</p>
//                       <p className="font-medium">{election.subscription_plan_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.updated_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Last Updated</p>
//                       <p className="font-medium text-sm">{formatDate(election.updated_at)}</p>
//                     </div>
//                   )}
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links 
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.custom_url}</p>
//                     </div>
//                   )}
//                   {election.shareable_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Shareable URL</p>
//                       <a
//                         href={election.shareable_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:underline text-sm break-all block"
//                       >
//                         {election.shareable_url}
//                       </a>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all block"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {election.topic_image_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-blue-600" />
//                     Topic Image
//                   </h3>
//                   <img
//                     src={election.topic_image_url}
//                     alt={election.title}
//                     className="w-full max-h-96 object-contain rounded-lg"
//                   />
//                 </div>
//               )}

//               {(election.topic_video_url || election.video_url) && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   {(() => {
//                     const videoUrl = election.topic_video_url || election.video_url;
                    
//                     if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
//                       let videoId = '';
                      
//                       if (videoUrl.includes('youtube.com/watch?v=')) {
//                         videoId = videoUrl.split('v=')[1]?.split('&')[0];
//                       } else if (videoUrl.includes('youtu.be/')) {
//                         videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
//                       } else if (videoUrl.includes('youtube.com/embed/')) {
//                         videoId = videoUrl.split('embed/')[1]?.split('?')[0];
//                       }
                      
//                       if (videoId) {
//                         return (
//                           <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
//                             <iframe
//                               className="absolute top-0 left-0 w-full h-full rounded-lg"
//                               src={`https://www.youtube.com/embed/${videoId}`}
//                               title="Election Video"
//                               frameBorder="0"
//                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                               allowFullScreen
//                             />
//                           </div>
//                         );
//                       }
//                     }
                    
//                     return (
//                       <video
//                         controls
//                         className="w-full rounded-lg"
//                         src={videoUrl}
//                       >
//                         Your browser does not support the video tag.
//                       </video>
//                     );
//                   })()}
//                 </div>
//               )}

//               {election.logo_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-purple-600" />
//                     Election Logo
//                   </h3>
//                   <img
//                     src={election.logo_url}
//                     alt="Logo"
//                     className="max-h-48 object-contain"
//                   />
//                 </div>
//               )}

//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.video_url && !election.logo_url && !election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600">No media files uploaded</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'questions' && (
//             <div className="space-y-4">
//               {questions.length > 0 ? (
//                 questions.map((question, idx) => (
//                   <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
//                     <div className="flex items-start gap-4">
//                       <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                         {idx + 1}
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="text-lg font-semibold text-gray-800 mb-2">
//                           {question.question_text}
//                         </h4>
//                         <div className="flex flex-wrap gap-2 mb-3">
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
//                             {question.question_type}
//                           </span>
//                           {question.is_required && (
//                             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
//                               Required
//                             </span>
//                           )}
//                           {question.max_selections > 1 && (
//                             <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
//                               Max: {question.max_selections}
//                             </span>
//                           )}
//                         </div>
//                         {question.question_image_url && (
//                           <img
//                             src={question.question_image_url}
//                             alt="Question"
//                             className="max-h-48 object-contain mb-3 rounded"
//                           />
//                         )}
//                         {question.options && question.options.length > 0 && (
//                           <div className="space-y-2">
//                             <p className="text-sm font-medium text-gray-700">Options:</p>
//                             {question.options.map((option) => (
//                               <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
//                                 <span className="flex-1">{option.option_text}</span>
//                                 {option.option_image_url && (
//                                   <img src={option.option_image_url} alt="Option" className="h-8 w-8 object-cover rounded" />
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <FaVoteYea className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600">No questions added yet</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'settings' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Election Settings</h3>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Show Live Results</span>
//                   <span className="font-medium">{election.show_live_results ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Vote Editing Allowed</span>
//                   <span className="font-medium">{election.vote_editing_allowed ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Biometric Required</span>
//                   <span className="font-medium">{election.biometric_required ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Anonymous Voting</span>
//                   <span className="font-medium">{election.anonymous_voting_enabled ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Video Watch Required</span>
//                   <span className="font-medium">{election.video_watch_required ? 'Yes' : 'No'}</span>
//                 </div>
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === 'gamify' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Gamification Configuration 
//               </h3>
              
//               {(election.lottery_enabled || election.lottery_config?.lottery_enabled) ? (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
//                     <span className="text-gray-700 font-medium">Lottery Status</span>
//                     <span className="font-bold text-green-600 flex items-center gap-2">
//                       <FaCheckCircle /> Active
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Number of Winners</span>
//                     <span className="font-medium text-lg">
//                       {election.lottery_winner_count || election.lottery_config?.winner_count || 1}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Prize Funding Source</span>
//                     <span className="font-medium capitalize">
//                       {(election.lottery_prize_funding_source || election.lottery_config?.prize_funding_source || 'N/A').replace('_', ' ')}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Reward Type</span>
//                     <span className="font-medium capitalize">
//                       {(election.lottery_reward_type || election.lottery_config?.reward_type || 'N/A').replace('_', ' ')}
//                     </span>
//                   </div>
                  
//                   {(election.lottery_estimated_value || election.lottery_config?.estimated_value) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded border border-green-200">
//                       <span className="text-gray-600 font-medium">Estimated Prize Value</span>
//                       <span className="font-bold text-green-600 text-xl">
//                         ${parseFloat(election.lottery_estimated_value || election.lottery_config?.estimated_value).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
//                       <span className="text-gray-600 font-medium">Total Prize Pool</span>
//                       <span className="font-bold text-blue-600 text-xl">
//                         ${parseFloat(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded border border-purple-200">
//                       <span className="text-gray-600 font-medium">Revenue Share</span>
//                       <span className="font-bold text-purple-600 text-lg">
//                         {election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage}%
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_projected_revenue || election.lottery_config?.projected_revenue) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded border border-indigo-200">
//                       <span className="text-gray-600 font-medium">Projected Revenue</span>
//                       <span className="font-bold text-indigo-600 text-xl">
//                         ${parseFloat(election.lottery_projected_revenue || election.lottery_config?.projected_revenue).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_prize_description || election.lottery_config?.prize_description) && (
//                     <div className="p-4 bg-blue-50 rounded border border-blue-200">
//                       <span className="text-gray-700 block mb-2 font-semibold">Prize Description</span>
//                       <p className="text-gray-800 leading-relaxed">
//                         {election.lottery_prize_description || election.lottery_config?.prize_description}
//                       </p>
//                     </div>
//                   )}
                  
//                   {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution) && 
//                    (election.lottery_prize_distribution?.length > 0 || election.lottery_config?.prize_distribution?.length > 0) && (
//                     <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border-2 border-yellow-300">
//                       <h4 className="text-gray-700 font-bold mb-3 flex items-center gap-2">
//                         <FaTrophy className="text-yellow-600" />
//                         Prize Distribution by Rank
//                       </h4>
//                       <div className="space-y-3">
//                         {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution).map((prize, idx) => (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
//                             <div className="flex items-center gap-3">
//                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
//                                 prize.rank === 1 ? 'bg-yellow-500' : 
//                                 prize.rank === 2 ? 'bg-gray-400' : 
//                                 prize.rank === 3 ? 'bg-orange-600' : 
//                                 'bg-blue-500'
//                               }`}>
//                                 {prize.rank}
//                               </div>
//                               <div>
//                                 <p className="font-semibold text-gray-800">
//                                   {prize.rank === 1 ? '🥇 First Place' : 
//                                    prize.rank === 2 ? '🥈 Second Place' : 
//                                    prize.rank === 3 ? '🥉 Third Place' : 
//                                    `Rank ${prize.rank}`}
//                                 </p>
//                                 {prize.prize_description && (
//                                   <p className="text-sm text-gray-600">{prize.prize_description}</p>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <span className="font-bold text-green-600 text-lg">
//                                 ${parseFloat(prize.prize_value || 0).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No Gamification configured for this election</p>
//                   <p className="text-sm text-gray-500 mt-2">Gamification features can be added when creating an election</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete &quot;<strong>{election.title}</strong>&quot;? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


















// //LAST successful code just to prove that is from shaped above code
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   FaArrowLeft,
//   FaEdit,
//   FaTrash,
//   FaShare,
//   FaCalendar,
//   FaClock,
//   FaGlobe,
//   FaUsers,
//   FaDollarSign,
//   FaVoteYea,
//   FaEye,
//   FaImage,
//   FaVideo,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaLock,
//   FaUnlock,
//   FaTrophy,
//   FaMapMarkerAlt,
//   FaBuilding,
//   FaPlayCircle,
// } from 'react-icons/fa';

// import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
// import { setCurrentElection } from '../../redux/slices/electionSlice';
// import SimilarElections from '../../components/ai/SimilarElections';
// //import SimilarElections from './SimilarElections';

// export default function ElectionView() {

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   // Check where user came from
//   const source = location.state?.source || 'all-elections';
//   const isFromMyElections = source === 'my-elections';

//   // Get current user ID from localStorage
//   const getCurrentUserId = () => {
//     try {
//       const userData = localStorage.getItem('userData');
//       if (userData) {
//         const parsed = JSON.parse(userData);
//         return parsed.userId || parsed.user_id || parsed.id || null;
//       }
//       const userId = localStorage.getItem('userId');
//       return userId ? parseInt(userId) : null;
//       /*eslint-disable*/
//     } catch (error) {
//       return null;
//     }
//   };

//   const currentUserId = getCurrentUserId();
//   const isOwner = election && currentUserId && String(election.creator_id) === String(currentUserId);
//   const hasActiveVotes = election && (election.vote_count > 0 || election.status === 'active');
  
//   const showEditDeleteButtons = isFromMyElections && isOwner;
//   const canModify = showEditDeleteButtons && !hasActiveVotes;
  
//   const backPath = isFromMyElections ? '/dashboard/my-elections' : '/dashboard/all-elections';
//   const backLabel = isFromMyElections ? 'Back to My Elections' : 'Back to All Elections';

//   useEffect(() => {
//     fetchElectionDetails();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       const electionResponse = await getElection(id);
//       console.log('✅ Election response:', electionResponse);
      
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       dispatch(setCurrentElection({
//         ...electionData,
//         currentStep: 4,
//         completedSteps: [1, 2, 3, 4],
//       }));
      
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         console.log('✅ Using questions from election response:', electionData.questions.length);
//         setQuestions(electionData.questions);
//       } else {
//         try {
//           const questionsResponse = await getElectionQuestions(id);
//           const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
//           console.log('✅ Fetched questions separately:', questionsData.length);
//           setQuestions(questionsData);
//         } catch (err) {
//           console.log('❌ Questions not available:', err);
//           setQuestions([]);
//         }
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching election:', error);
//       toast.error('Failed to load election details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!canModify) {
//       toast.error('You cannot delete this election');
//       return;
//     }
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard/my-elections');
//      /*eslint-disable*/
//     } catch (error) {
//       toast.error('Failed to delete election');
//     }
//   };

//   const handleShare = () => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return 'N/A';
//     return timeString;
//   };

//   const getStatusBadge = (status) => {
//     const configs = {
//       draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaClock },
//       published: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
//       active: { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
//       completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaCheckCircle },
//       cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
//     };
//     return configs[status?.toLowerCase()] || configs.draft;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!election) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
//           <button
//             onClick={() => navigate('/dashboard/all-elections')}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusConfig = getStatusBadge(election.status);
//   const StatusIcon = statusConfig.icon;

//   // Helper function to render regional pricing tooltip content
//   const renderRegionalPricingTooltip = () => {
//     if (election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0) {
//       return (
//         <div className="space-y-1">
//           {election.regional_pricing.slice(0, 5).map((region, idx) => (
//             <div key={idx} className="flex justify-between gap-3">
//               <span>{region.region_name}</span>
//               <span className="text-green-300 font-semibold">${parseFloat(region.participation_fee).toFixed(2)}</span>
//             </div>
//           ))}
//           {election.regional_pricing.length > 5 && (
//             <div className="text-gray-400 text-center pt-1">+{election.regional_pricing.length - 5} more</div>
//           )}
//         </div>
//       );
//     }
//     return (
//       <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
//     );
//   };

//   // Helper function to get fee display value
//   const getFeeDisplayValue = () => {
//     if (election.is_free) return 'Free';
//     if (election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0) {
//       const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
//       const min = Math.min(...fees);
//       const max = Math.max(...fees);
//       return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
//     }
//     return `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`;
//   };

//   // Helper function to get pricing type label
//   const getPricingTypeLabel = () => {
//     if (election.pricing_type === 'regional_fee') return '🌍 Regional Pricing';
//     if (election.pricing_type === 'general_fee') return '💵 Fixed Fee';
//     return 'Paid Election';
//   };

//   // Helper function to get fee type suffix
//   const getFeeTypeSuffix = () => {
//     if (election.pricing_type === 'regional_fee') return '(Regional)';
//     if (election.pricing_type === 'general_fee') return '(Fixed)';
//     return '';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header Section */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate(backPath)}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> {backLabel}
//           </button>

//           {/* View Only Mode Banner */}
//           {!isFromMyElections && (
//             <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
//               <div className="flex items-center gap-2">
//                 <FaEye className="text-blue-600" />
//                 <span className="text-blue-800 font-medium">View Only Mode</span>
//               </div>
//               <p className="text-sm text-blue-600 mt-1">
//                 To edit or delete, go to{' '}
//                 <button 
//                   onClick={() => navigate('/dashboard/my-elections')} 
//                   className="underline font-semibold"
//                 >
//                   My Elections
//                 </button>
//               </p>
//             </div>
//           )}

//           {/* Election Header Card */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
//                   <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
//                     <StatusIcon className="text-xs" />
//                     {election.status}
//                   </span>
//                 </div>
//                 <p className="text-gray-600">{election.description}</p>
                
//                 {/* Ownership indicator */}
//                 {isOwner && (
//                   <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
//                     <FaCheckCircle /> You own this election
//                   </div>
//                 )}
                
//                 {/* Active votes warning */}
//                 {showEditDeleteButtons && hasActiveVotes && (
//                   <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
//                     <FaLock /> Cannot modify - has active votes
//                   </div>
//                 )}
//               </div>
              
//               {/* Action Buttons */}
//               <div className="flex gap-2">
//                 {showEditDeleteButtons && (
//                   <button
//                     onClick={() => canModify && navigate(`/dashboard/create-election?edit=${election.id}`)}
//                     disabled={!canModify}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                       canModify
//                         ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     title={hasActiveVotes ? 'Cannot modify - has active votes' : 'Edit this election'}
//                   >
//                     <FaEdit /> Edit
//                   </button>
//                 )}
                
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
                
//                 {showEditDeleteButtons && (
//                   <button
//                     onClick={() => canModify && setDeleteModal(true)}
//                     disabled={!canModify}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                       canModify
//                         ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                     title={hasActiveVotes ? 'Cannot modify - has active votes' : 'Delete this election'}
//                   >
//                     <FaTrash /> Delete
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
//                   <FaVoteYea />
//                   {election.vote_count || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Votes</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
//                   <FaEye />
//                   {election.view_count || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Views</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
//                   <FaUsers />
//                   {questions.length || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Questions</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1 relative group">
//                   <FaDollarSign />
//                   {getFeeDisplayValue()}
                  
//                   {!election.is_free && (
//                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
//                       <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
//                         <div className="font-semibold mb-1 text-orange-300">
//                           {getPricingTypeLabel()}
//                         </div>
//                         {renderRegionalPricingTooltip()}
//                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
//                           <div className="border-8 border-transparent border-t-gray-900"></div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   Fee {getFeeTypeSuffix()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs Navigation */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'gamify'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
//                   activeTab === tab
//                     ? 'border-b-2 border-blue-600 text-blue-600'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="space-y-6">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Schedule Card */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaCalendar className="text-blue-600" />
//                   Schedule
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Start Date</p>
//                     <p className="font-medium">{formatDate(election.start_date)}</p>
//                     {election.start_time && (
//                       <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">End Date</p>
//                     <p className="font-medium">{formatDate(election.end_date)}</p>
//                     {election.end_time && (
//                       <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Timezone</p>
//                     <p className="font-medium">{election.timezone || 'UTC'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Voting Configuration Card */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaVoteYea className="text-purple-600" />
//                   Voting Configuration
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Voting Type</p>
//                     <p className="font-medium capitalize">{election.voting_type || 'Plurality'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Live Results</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.show_live_results ? (
//                         <><FaCheckCircle className="text-green-600" /> Enabled</>
//                       ) : (
//                         <><FaTimesCircle className="text-red-600" /> Disabled</>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Vote Editing</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.vote_editing_allowed ? (
//                         <><FaCheckCircle className="text-green-600" /> Allowed</>
//                       ) : (
//                         <><FaTimesCircle className="text-red-600" /> Not Allowed</>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Biometric Required</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.biometric_required ? (
//                         <><FaLock className="text-orange-600" /> Yes</>
//                       ) : (
//                         <><FaUnlock className="text-green-600" /> No</>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Anonymous Voting</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.anonymous_voting_enabled ? (
//                         <><FaCheckCircle className="text-green-600" /> Enabled</>
//                       ) : (
//                         <><FaTimesCircle className="text-red-600" /> Disabled</>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Access Control Card */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaGlobe className="text-green-600" />
//                   Access Control
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Permission Type</p>
//                     <p className="font-medium capitalize">{election.permission_type?.replace('_', ' ') || 'Public'}</p>
//                   </div>
//                   {election.allowed_countries && election.allowed_countries.length > 0 ? (
//                     <div>
//                       <p className="text-sm text-gray-600 mb-2">Allowed Countries ({election.allowed_countries.length})</p>
//                       <div className="flex flex-wrap gap-2">
//                         {election.allowed_countries.map((country, idx) => (
//                           <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
//                             {country}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <p className="text-sm text-gray-600">Allowed Countries</p>
//                       <p className="font-medium">All Countries</p>
//                     </div>
//                   )}
//                   {election.authentication_methods && election.authentication_methods.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600 mb-2">Authentication Methods</p>
//                       <div className="flex flex-wrap gap-2">
//                         {election.authentication_methods.map((method, idx) => (
//                           <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded capitalize">
//                             {method.replace('_', ' ')}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Pricing Card */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaDollarSign className="text-yellow-600" />
//                   Pricing
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Type</p>
//                     <p className="font-medium capitalize">
//                       {election.is_free ? 'Free' : (election.pricing_type?.replace('_', ' ') || 'Paid')}
//                     </p>
//                   </div>
//                   {!election.is_free && (
//                     <>
//                       {election.pricing_type === 'regional_fee' && election.regional_pricing && election.regional_pricing.length > 0 ? (
//                         <div>
//                           <p className="text-sm text-gray-600 mb-2">Regional Pricing</p>
//                           <div className="space-y-2">
//                             {election.regional_pricing.map((region, idx) => (
//                               <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                                 <span className="text-sm">{region.region_name}</span>
//                                 <span className="font-semibold text-green-600">
//                                   ${parseFloat(region.participation_fee).toFixed(2)} {region.currency}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           <p className="text-sm text-gray-600">Participation Fee</p>
//                           <p className="font-medium text-2xl text-green-600">
//                             ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
//                           </p>
//                         </div>
//                       )}
//                       {election.processing_fee_percentage > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Processing Fee</p>
//                           <p className="font-medium">{election.processing_fee_percentage}%</p>
//                         </div>
//                       )}
//                       {election.prize_pool && parseFloat(election.prize_pool) > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Prize Pool</p>
//                           <p className="font-medium text-lg text-purple-600">
//                             ${parseFloat(election.prize_pool).toFixed(2)}
//                           </p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Video Watch Requirements Card */}
//               {(election.video_watch_required || 
//                 election.required_watch_duration_minutes > 0 || 
//                 (election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0) ||
//                 election.minimum_watch_time > 0) && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaPlayCircle className="text-red-600" />
//                     Video Watch Requirements
//                   </h3>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-sm text-gray-600">Video Watch Required</p>
//                       <p className="font-medium flex items-center gap-2">
//                         {election.video_watch_required ? (
//                           <><FaCheckCircle className="text-green-600" /> Yes</>
//                         ) : (
//                           <><FaTimesCircle className="text-red-600" /> No</>
//                         )}
//                       </p>
//                     </div>
//                     {election.required_watch_duration_minutes > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Required Watch Duration</p>
//                         <p className="font-medium">{election.required_watch_duration_minutes} minutes</p>
//                       </div>
//                     )}
//                     {election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Minimum Watch Percentage</p>
//                         <p className="font-medium">{parseFloat(election.minimum_watch_percentage).toFixed(2)}%</p>
//                       </div>
//                     )}
//                     {election.minimum_watch_time > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Minimum Watch Time</p>
//                         <p className="font-medium">{election.minimum_watch_time} seconds</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Creator Information Card */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaBuilding className="text-indigo-600" />
//                   Creator Information 
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Creator Type</p>
//                     <p className="font-medium capitalize">{election.creator_type || 'Individual'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Creator ID</p>
//                     <p className="font-medium">
//                       {election.creator_id}
//                       {isOwner && (
//                         <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">You</span>
//                       )}
//                     </p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   {election.category_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Category ID</p>
//                       <p className="font-medium">{election.category_id}</p>
//                     </div>
//                   )}
//                   {election.subscription_plan_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Subscription Plan ID</p>
//                       <p className="font-medium">{election.subscription_plan_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.updated_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Last Updated</p>
//                       <p className="font-medium text-sm">{formatDate(election.updated_at)}</p>
//                     </div>
//                   )}
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* URLs & Links Card */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links 
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.custom_url}</p>
//                     </div>
//                   )}
//                   {election.shareable_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Shareable URL</p>
//                       <a
//                         href={election.shareable_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:underline text-sm break-all block"
//                       >
//                         {election.shareable_url}
//                       </a>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all block"
//                     >
//                       {`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Media Tab */}
//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {election.topic_image_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-blue-600" />
//                     Topic Image
//                   </h3>
//                   <img
//                     src={election.topic_image_url}
//                     alt={election.title}
//                     className="w-full max-h-96 object-contain rounded-lg"
//                   />
//                 </div>
//               )}

//               {(election.topic_video_url || election.video_url) && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   {renderVideoPlayer(election.topic_video_url || election.video_url)}
//                 </div>
//               )}

//               {election.logo_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-purple-600" />
//                     Election Logo
//                   </h3>
//                   <img
//                     src={election.logo_url}
//                     alt="Logo"
//                     className="max-h-48 object-contain"
//                   />
//                 </div>
//               )}

//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div 
//                     className="prose max-w-none" 
//                     dangerouslySetInnerHTML={{ __html: election.voting_body_content }} 
//                   />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.video_url && !election.logo_url && !election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600">No media files uploaded</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Questions Tab */}
//           {activeTab === 'questions' && (
//             <div className="space-y-4">
//               {questions.length > 0 ? (
//                 questions.map((question, idx) => (
//                   <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
//                     <div className="flex items-start gap-4">
//                       <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                         {idx + 1}
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="text-lg font-semibold text-gray-800 mb-2">
//                           {question.question_text}
//                         </h4>
//                         <div className="flex flex-wrap gap-2 mb-3">
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
//                             {question.question_type}
//                           </span>
//                           {question.is_required && (
//                             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
//                               Required
//                             </span>
//                           )}
//                           {question.max_selections > 1 && (
//                             <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
//                               Max: {question.max_selections}
//                             </span>
//                           )}
//                         </div>
//                         {question.question_image_url && (
//                           <img
//                             src={question.question_image_url}
//                             alt="Question"
//                             className="max-h-48 object-contain mb-3 rounded"
//                           />
//                         )}
//                         {question.options && question.options.length > 0 && (
//                           <div className="space-y-2">
//                             <p className="text-sm font-medium text-gray-700">Options:</p>
//                             {question.options.map((option) => (
//                               <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
//                                 <span className="flex-1">{option.option_text}</span>
//                                 {option.option_image_url && (
//                                   <img 
//                                     src={option.option_image_url} 
//                                     alt="Option" 
//                                     className="h-8 w-8 object-cover rounded" 
//                                   />
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <FaVoteYea className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600">No questions added yet</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Settings Tab */}
//           {activeTab === 'settings' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Election Settings</h3>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Show Live Results</span>
//                   <span className="font-medium">{election.show_live_results ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Vote Editing Allowed</span>
//                   <span className="font-medium">{election.vote_editing_allowed ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Biometric Required</span>
//                   <span className="font-medium">{election.biometric_required ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Anonymous Voting</span>
//                   <span className="font-medium">{election.anonymous_voting_enabled ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Video Watch Required</span>
//                   <span className="font-medium">{election.video_watch_required ? 'Yes' : 'No'}</span>
//                 </div>
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Gamify Tab */}
//           {activeTab === 'gamify' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Gamification Configuration 
//               </h3>
              
//               {(election.lottery_enabled || election.lottery_config?.lottery_enabled) ? (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
//                     <span className="text-gray-700 font-medium">Lottery Status</span>
//                     <span className="font-bold text-green-600 flex items-center gap-2">
//                       <FaCheckCircle /> Active
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Number of Winners</span>
//                     <span className="font-medium text-lg">
//                       {election.lottery_winner_count || election.lottery_config?.winner_count || 1}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Prize Funding Source</span>
//                     <span className="font-medium capitalize">
//                       {(election.lottery_prize_funding_source || election.lottery_config?.prize_funding_source || 'N/A').replace('_', ' ')}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Reward Type</span>
//                     <span className="font-medium capitalize">
//                       {(election.lottery_reward_type || election.lottery_config?.reward_type || 'N/A').replace('_', ' ')}
//                     </span>
//                   </div>
                  
//                   {(election.lottery_estimated_value || election.lottery_config?.estimated_value) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded border border-green-200">
//                       <span className="text-gray-600 font-medium">Estimated Prize Value</span>
//                       <span className="font-bold text-green-600 text-xl">
//                         ${parseFloat(election.lottery_estimated_value || election.lottery_config?.estimated_value).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
//                       <span className="text-gray-600 font-medium">Total Prize Pool</span>
//                       <span className="font-bold text-blue-600 text-xl">
//                         ${parseFloat(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded border border-purple-200">
//                       <span className="text-gray-600 font-medium">Revenue Share</span>
//                       <span className="font-bold text-purple-600 text-lg">
//                         {election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage}%
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_projected_revenue || election.lottery_config?.projected_revenue) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded border border-indigo-200">
//                       <span className="text-gray-600 font-medium">Projected Revenue</span>
//                       <span className="font-bold text-indigo-600 text-xl">
//                         ${parseFloat(election.lottery_projected_revenue || election.lottery_config?.projected_revenue).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_prize_description || election.lottery_config?.prize_description) && (
//                     <div className="p-4 bg-blue-50 rounded border border-blue-200">
//                       <span className="text-gray-700 block mb-2 font-semibold">Prize Description</span>
//                       <p className="text-gray-800 leading-relaxed">
//                         {election.lottery_prize_description || election.lottery_config?.prize_description}
//                       </p>
//                     </div>
//                   )}
                  
//                   {/* Prize Distribution */}
//                   {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution) && 
//                    (election.lottery_prize_distribution?.length > 0 || election.lottery_config?.prize_distribution?.length > 0) && (
//                     <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border-2 border-yellow-300">
//                       <h4 className="text-gray-700 font-bold mb-3 flex items-center gap-2">
//                         <FaTrophy className="text-yellow-600" />
//                         Prize Distribution by Rank
//                       </h4>
//                       <div className="space-y-3">
//                         {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution).map((prize, idx) => {
//                           const getRankBgColor = (rank) => {
//                             if (rank === 1) return 'bg-yellow-500';
//                             if (rank === 2) return 'bg-gray-400';
//                             if (rank === 3) return 'bg-orange-600';
//                             return 'bg-blue-500';
//                           };
                          
//                           const getRankLabel = (rank) => {
//                             if (rank === 1) return '🥇 First Place';
//                             if (rank === 2) return '🥈 Second Place';
//                             if (rank === 3) return '🥉 Third Place';
//                             return `Rank ${rank}`;
//                           };
                          
//                           return (
//                             <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
//                               <div className="flex items-center gap-3">
//                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getRankBgColor(prize.rank)}`}>
//                                   {prize.rank}
//                                 </div>
//                                 <div>
//                                   <p className="font-semibold text-gray-800">
//                                     {getRankLabel(prize.rank)}
//                                   </p>
//                                   {prize.prize_description && (
//                                     <p className="text-sm text-gray-600">{prize.prize_description}</p>
//                                   )}
//                                 </div>
//                               </div>
//                               <div className="text-right">
//                                 <span className="font-bold text-green-600 text-lg">
//                                   ${parseFloat(prize.prize_value || 0).toFixed(2)}
//                                 </span>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No Gamification configured for this election</p>
//                   <p className="text-sm text-gray-500 mt-2">Gamification features can be added when creating an election</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Similar Elections Section - Shaped AI Recommendations */}
//         <div className="mt-8">
//           <SimilarElections electionId={id} />
//         </div>
//       </div>

//       {/* Delete Modal */}
//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete &quot;<strong>{election.title}</strong>&quot;? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Helper function to render video player
// function renderVideoPlayer(videoUrl) {
//   if (!videoUrl) return null;
  
//   if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
//     let videoId = '';
    
//     if (videoUrl.includes('youtube.com/watch?v=')) {
//       videoId = videoUrl.split('v=')[1]?.split('&')[0];
//     } else if (videoUrl.includes('youtu.be/')) {
//       videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
//     } else if (videoUrl.includes('youtube.com/embed/')) {
//       videoId = videoUrl.split('embed/')[1]?.split('?')[0];
//     }
    
//     if (videoId) {
//       return (
//         <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
//           <iframe
//             className="absolute top-0 left-0 w-full h-full rounded-lg"
//             src={`https://www.youtube.com/embed/${videoId}`}
//             title="Election Video"
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           />
//         </div>
//       );
//     }
//   }
  
//   return (
//     <video
//       controls
//       className="w-full rounded-lg"
//       src={videoUrl}
//     >
//       Your browser does not support the video tag.
//     </video>
//   );
// }






















//last workable code, only to add ai above code
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   FaArrowLeft,
//   FaEdit,
//   FaTrash,
//   FaShare,
//   FaCalendar,
//   FaClock,
//   FaGlobe,
//   FaUsers,
//   FaDollarSign,
//   FaVoteYea,
//   FaEye,
//   FaImage,
//   FaVideo,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaLock,
//   FaUnlock,
//   FaTrophy,
//   FaMapMarkerAlt,
//   FaBuilding,
//   FaPlayCircle,
//   FaBan,
// } from 'react-icons/fa';

// import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
// import { setCurrentElection } from '../../redux/slices/electionSlice';

// export default function ElectionView() {

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   // ✅ NEW: Check where user came from
//   const source = location.state?.source || 'all-elections';
//   const isFromMyElections = source === 'my-elections';

//   // ✅ Get current user ID from localStorage
//   const getCurrentUserId = () => {
//     try {
//       const userData = localStorage.getItem('userData');
//       if (userData) {
//         const parsed = JSON.parse(userData);
//         return parsed.userId || parsed.user_id || parsed.id || null;
//       }
//       const userId = localStorage.getItem('userId');
//       return userId ? parseInt(userId) : null;
//       /*eslint-disable*/
//     } catch (error) {
//       return null;
//     }
//   };

//   const currentUserId = getCurrentUserId();
//   const isOwner = election && currentUserId && String(election.creator_id) === String(currentUserId);
//   const hasActiveVotes = election && (election.vote_count > 0 || election.status === 'active');
  
//   // ✅ Can modify only if: from My Elections + owner + no active votes
//   const canModify = isFromMyElections && isOwner && !hasActiveVotes;
  
//   const backPath = isFromMyElections ? '/dashboard/my-elections' : '/dashboard/all-elections';
//   const backLabel = isFromMyElections ? 'Back to My Elections' : 'Back to All Elections';

//   useEffect(() => {
//     fetchElectionDetails();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       const electionResponse = await getElection(id);
//       console.log('✅ Election response:', electionResponse);
      
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       dispatch(setCurrentElection({
//         ...electionData,
//         currentStep: 4,
//         completedSteps: [1, 2, 3, 4],
//       }));
      
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         console.log('✅ Using questions from election response:', electionData.questions.length);
//         setQuestions(electionData.questions);
//       } else {
//         try {
//           const questionsResponse = await getElectionQuestions(id);
//           const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
//           console.log('✅ Fetched questions separately:', questionsData.length);
//           setQuestions(questionsData);
//         } catch (err) {
//           console.log('❌ Questions not available:', err);
//           setQuestions([]);
//         }
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching election:', error);
//       toast.error('Failed to load election details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!canModify) {
//       toast.error('You cannot delete this election');
//       return;
//     }
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard/my-elections');
//      /*eslint-disable*/
//     } catch (error) {
//       toast.error('Failed to delete election');
//     }
//   };

//   const handleShare = () => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', {
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return 'N/A';
//     return timeString;
//   };

//   const getStatusBadge = (status) => {
//     const configs = {
//       draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaClock },
//       published: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
//       active: { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
//       completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaCheckCircle },
//       cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
//     };
//     return configs[status?.toLowerCase()] || configs.draft;
//   };

//   // ✅ Get reason why buttons are disabled
//   const getDisabledReason = () => {
//     if (!isFromMyElections) return 'Go to My Elections to edit/delete';
//     if (!isOwner) return 'You can only modify your own elections';
//     if (hasActiveVotes) return 'Cannot modify election with active votes';
//     return '';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!election) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
//           <button
//             onClick={() => navigate('/dashboard/all-elections')}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusConfig = getStatusBadge(election.status);
//   const StatusIcon = statusConfig.icon;
//   const disabledReason = getDisabledReason();

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mb-6">
//           <button
//             onClick={() => navigate(backPath)}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> {backLabel}
//           </button>

//           {/* ✅ View Only Mode Banner */}
//           {!isFromMyElections && (
//             <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
//               <div className="flex items-center gap-2">
//                 <FaEye className="text-blue-600" />
//                 <span className="text-blue-800 font-medium">View Only Mode</span>
//               </div>
//               <p className="text-sm text-blue-600 mt-1">
//                 To edit or delete, go to <button onClick={() => navigate('/dashboard/my-elections')} className="underline font-semibold">My Elections</button>
//               </p>
//             </div>
//           )}

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
//                   <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
//                     <StatusIcon className="text-xs" />
//                     {election.status}
//                   </span>
//                 </div>
//                 <p className="text-gray-600">{election.description}</p>
                
//                 {/* Ownership indicator */}
//                 {isOwner && (
//                   <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
//                     <FaCheckCircle /> You own this election
//                   </div>
//                 )}
                
//                 {/* Active votes warning */}
//                 {isFromMyElections && isOwner && hasActiveVotes && (
//                   <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
//                     <FaLock /> Cannot modify - has active votes
//                   </div>
//                 )}
//               </div>
              
//               {/* ✅ UPDATED: Action Buttons */}
//               <div className="flex gap-2">
//                 <button
//                   // onClick={() => canModify && navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
//                   onClick={() => canModify && navigate(`/dashboard/create-election?edit=${election.id}`)}
//                   disabled={!canModify}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     canModify
//                       ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   }`}
//                   title={disabledReason || 'Edit this election'}
//                 >
//                   {canModify ? <FaEdit /> : <FaBan />} Edit
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
//                 <button
//                   onClick={() => canModify && setDeleteModal(true)}
//                   disabled={!canModify}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     canModify
//                       ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
//                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   }`}
//                   title={disabledReason || 'Delete this election'}
//                 >
//                   {canModify ? <FaTrash /> : <FaBan />} Delete
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
//                   <FaVoteYea />
//                   {election.vote_count || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Votes</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
//                   <FaEye />
//                   {election.view_count || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Views</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
//                   <FaUsers />
//                   {questions.length || 0}
//                 </div>
//                 <p className="text-sm text-gray-600">Questions</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1 relative group">
//                   <FaDollarSign />
//                   {election.is_free ? 'Free' : 
//                     election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ?
//                       (() => {
//                         const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
//                         const min = Math.min(...fees);
//                         const max = Math.max(...fees);
//                         return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
//                       })()
//                     : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`
//                   }
                  
//                   {!election.is_free && (
//                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
//                       <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
//                         <div className="font-semibold mb-1 text-orange-300">
//                           {election.pricing_type === 'regional_fee' ? '🌍 Regional Pricing' : 
//                            election.pricing_type === 'general_fee' ? '💵 Fixed Fee' : 'Paid Election'}
//                         </div>
//                         {election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ? (
//                           <div className="space-y-1">
//                             {election.regional_pricing.slice(0, 5).map((region, idx) => (
//                               <div key={idx} className="flex justify-between gap-3">
//                                 <span>{region.region_name}</span>
//                                 <span className="text-green-300 font-semibold">${parseFloat(region.participation_fee).toFixed(2)}</span>
//                               </div>
//                             ))}
//                             {election.regional_pricing.length > 5 && (
//                               <div className="text-gray-400 text-center pt-1">+{election.regional_pricing.length - 5} more</div>
//                             )}
//                           </div>
//                         ) : (
//                           <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
//                         )}
//                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
//                           <div className="border-8 border-transparent border-t-gray-900"></div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   Fee {election.pricing_type === 'regional_fee' ? '(Regional)' : election.pricing_type === 'general_fee' ? '(Fixed)' : ''}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'gamify'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
//                   activeTab === tab
//                     ? 'border-b-2 border-blue-600 text-blue-600'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-6">
//           {activeTab === 'overview' && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaCalendar className="text-blue-600" />
//                   Schedule
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Start Date</p>
//                     <p className="font-medium">{formatDate(election.start_date)}</p>
//                     {election.start_time && <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">End Date</p>
//                     <p className="font-medium">{formatDate(election.end_date)}</p>
//                     {election.end_time && <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Timezone</p>
//                     <p className="font-medium">{election.timezone || 'UTC'}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaVoteYea className="text-purple-600" />
//                   Voting Configuration
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Voting Type</p>
//                     <p className="font-medium capitalize">{election.voting_type || 'Plurality'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Live Results</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.show_live_results ? (
//                         <>
//                           <FaCheckCircle className="text-green-600" /> Enabled
//                         </>
//                       ) : (
//                         <>
//                           <FaTimesCircle className="text-red-600" /> Disabled
//                         </>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Vote Editing</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.vote_editing_allowed ? (
//                         <>
//                           <FaCheckCircle className="text-green-600" /> Allowed
//                         </>
//                       ) : (
//                         <>
//                           <FaTimesCircle className="text-red-600" /> Not Allowed
//                         </>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Biometric Required</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.biometric_required ? (
//                         <>
//                           <FaLock className="text-orange-600" /> Yes
//                         </>
//                       ) : (
//                         <>
//                           <FaUnlock className="text-green-600" /> No
//                         </>
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Anonymous Voting</p>
//                     <p className="font-medium flex items-center gap-2">
//                       {election.anonymous_voting_enabled ? (
//                         <>
//                           <FaCheckCircle className="text-green-600" /> Enabled
//                         </>
//                       ) : (
//                         <>
//                           <FaTimesCircle className="text-red-600" /> Disabled
//                         </>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaGlobe className="text-green-600" />
//                   Access Control
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Permission Type</p>
//                     <p className="font-medium capitalize">{election.permission_type?.replace('_', ' ') || 'Public'}</p>
//                   </div>
//                   {election.allowed_countries && election.allowed_countries.length > 0 ? (
//                     <div>
//                       <p className="text-sm text-gray-600 mb-2">Allowed Countries ({election.allowed_countries.length})</p>
//                       <div className="flex flex-wrap gap-2">
//                         {election.allowed_countries.map((country, idx) => (
//                           <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
//                             {country}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <p className="text-sm text-gray-600">Allowed Countries</p>
//                       <p className="font-medium">All Countries</p>
//                     </div>
//                   )}
//                   {election.authentication_methods && election.authentication_methods.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600 mb-2">Authentication Methods</p>
//                       <div className="flex flex-wrap gap-2">
//                         {election.authentication_methods.map((method, idx) => (
//                           <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded capitalize">
//                             {method.replace('_', ' ')}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaDollarSign className="text-yellow-600" />
//                   Pricing
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Type</p>
//                     <p className="font-medium capitalize">
//                       {election.is_free ? 'Free' : (election.pricing_type?.replace('_', ' ') || 'Paid')}
//                     </p>
//                   </div>
//                   {!election.is_free && (
//                     <>
//                       {election.pricing_type === 'regional_fee' && election.regional_pricing && election.regional_pricing.length > 0 ? (
//                         <div>
//                           <p className="text-sm text-gray-600 mb-2">Regional Pricing</p>
//                           <div className="space-y-2">
//                             {election.regional_pricing.map((region, idx) => (
//                               <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                                 <span className="text-sm">{region.region_name}</span>
//                                 <span className="font-semibold text-green-600">
//                                   ${parseFloat(region.participation_fee).toFixed(2)} {region.currency}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           <p className="text-sm text-gray-600">Participation Fee</p>
//                           <p className="font-medium text-2xl text-green-600">
//                             ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
//                           </p>
//                         </div>
//                       )}
//                       {election.processing_fee_percentage > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Processing Fee</p>
//                           <p className="font-medium">{election.processing_fee_percentage}%</p>
//                         </div>
//                       )}
//                       {election.prize_pool && parseFloat(election.prize_pool) > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Prize Pool</p>
//                           <p className="font-medium text-lg text-purple-600">
//                             ${parseFloat(election.prize_pool).toFixed(2)}
//                           </p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {(election.video_watch_required || 
//                 election.required_watch_duration_minutes > 0 || 
//                 (election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0) ||
//                 election.minimum_watch_time > 0) && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaPlayCircle className="text-red-600" />
//                     Video Watch Requirements
//                   </h3>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-sm text-gray-600">Video Watch Required</p>
//                       <p className="font-medium flex items-center gap-2">
//                         {election.video_watch_required ? (
//                           <>
//                             <FaCheckCircle className="text-green-600" /> Yes
//                           </>
//                         ) : (
//                           <>
//                             <FaTimesCircle className="text-red-600" /> No
//                           </>
//                         )}
//                       </p>
//                     </div>
//                     {election.required_watch_duration_minutes > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Required Watch Duration</p>
//                         <p className="font-medium">{election.required_watch_duration_minutes} minutes</p>
//                       </div>
//                     )}
//                     {election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Minimum Watch Percentage</p>
//                         <p className="font-medium">{parseFloat(election.minimum_watch_percentage).toFixed(2)}%</p>
//                       </div>
//                     )}
//                     {election.minimum_watch_time > 0 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Minimum Watch Time</p>
//                         <p className="font-medium">{election.minimum_watch_time} seconds</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaBuilding className="text-indigo-600" />
//                   Creator Information 
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Creator Type</p>
//                     <p className="font-medium capitalize">{election.creator_type || 'Individual'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Creator ID</p>
//                     <p className="font-medium">
//                       {election.creator_id}
//                       {isOwner && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">You</span>}
//                     </p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   {election.category_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Category ID</p>
//                       <p className="font-medium">{election.category_id}</p>
//                     </div>
//                   )}
//                   {election.subscription_plan_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Subscription Plan ID</p>
//                       <p className="font-medium">{election.subscription_plan_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.updated_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Last Updated</p>
//                       <p className="font-medium text-sm">{formatDate(election.updated_at)}</p>
//                     </div>
//                   )}
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links 
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.custom_url}</p>
//                     </div>
//                   )}
//                   {election.shareable_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Shareable URL</p>
//                       <a
//                         href={election.shareable_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:underline text-sm break-all block"
//                       >
//                         {election.shareable_url}
//                       </a>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all block"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {election.topic_image_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-blue-600" />
//                     Topic Image
//                   </h3>
//                   <img
//                     src={election.topic_image_url}
//                     alt={election.title}
//                     className="w-full max-h-96 object-contain rounded-lg"
//                   />
//                 </div>
//               )}

//               {(election.topic_video_url || election.video_url) && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   {(() => {
//                     const videoUrl = election.topic_video_url || election.video_url;
                    
//                     if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
//                       let videoId = '';
                      
//                       if (videoUrl.includes('youtube.com/watch?v=')) {
//                         videoId = videoUrl.split('v=')[1]?.split('&')[0];
//                       } else if (videoUrl.includes('youtu.be/')) {
//                         videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
//                       } else if (videoUrl.includes('youtube.com/embed/')) {
//                         videoId = videoUrl.split('embed/')[1]?.split('?')[0];
//                       }
                      
//                       if (videoId) {
//                         return (
//                           <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
//                             <iframe
//                               className="absolute top-0 left-0 w-full h-full rounded-lg"
//                               src={`https://www.youtube.com/embed/${videoId}`}
//                               title="Election Video"
//                               frameBorder="0"
//                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                               allowFullScreen
//                             />
//                           </div>
//                         );
//                       }
//                     }
                    
//                     return (
//                       <video
//                         controls
//                         className="w-full rounded-lg"
//                         src={videoUrl}
//                       >
//                         Your browser does not support the video tag.
//                       </video>
//                     );
//                   })()}
//                 </div>
//               )}

//               {election.logo_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-purple-600" />
//                     Election Logo
//                   </h3>
//                   <img
//                     src={election.logo_url}
//                     alt="Logo"
//                     className="max-h-48 object-contain"
//                   />
//                 </div>
//               )}

//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.video_url && !election.logo_url && !election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600">No media files uploaded</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'questions' && (
//             <div className="space-y-4">
//               {questions.length > 0 ? (
//                 questions.map((question, idx) => (
//                   <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
//                     <div className="flex items-start gap-4">
//                       <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                         {idx + 1}
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="text-lg font-semibold text-gray-800 mb-2">
//                           {question.question_text}
//                         </h4>
//                         <div className="flex flex-wrap gap-2 mb-3">
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
//                             {question.question_type}
//                           </span>
//                           {question.is_required && (
//                             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
//                               Required
//                             </span>
//                           )}
//                           {question.max_selections > 1 && (
//                             <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
//                               Max: {question.max_selections}
//                             </span>
//                           )}
//                         </div>
//                         {question.question_image_url && (
//                           <img
//                             src={question.question_image_url}
//                             alt="Question"
//                             className="max-h-48 object-contain mb-3 rounded"
//                           />
//                         )}
//                         {question.options && question.options.length > 0 && (
//                           <div className="space-y-2">
//                             <p className="text-sm font-medium text-gray-700">Options:</p>
//                             {question.options.map((option) => (
//                               <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
//                                 <span className="flex-1">{option.option_text}</span>
//                                 {option.option_image_url && (
//                                   <img src={option.option_image_url} alt="Option" className="h-8 w-8 object-cover rounded" />
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <FaVoteYea className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600">No questions added yet</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'settings' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Election Settings</h3>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Show Live Results</span>
//                   <span className="font-medium">{election.show_live_results ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Vote Editing Allowed</span>
//                   <span className="font-medium">{election.vote_editing_allowed ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Biometric Required</span>
//                   <span className="font-medium">{election.biometric_required ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Anonymous Voting</span>
//                   <span className="font-medium">{election.anonymous_voting_enabled ? 'Yes' : 'No'}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                   <span className="text-gray-600">Video Watch Required</span>
//                   <span className="font-medium">{election.video_watch_required ? 'Yes' : 'No'}</span>
//                 </div>
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === 'gamify' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Gamification Configuration 
//               </h3>
              
//               {(election.lottery_enabled || election.lottery_config?.lottery_enabled) ? (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
//                     <span className="text-gray-700 font-medium">Lottery Status</span>
//                     <span className="font-bold text-green-600 flex items-center gap-2">
//                       <FaCheckCircle /> Active
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Number of Winners</span>
//                     <span className="font-medium text-lg">
//                       {election.lottery_winner_count || election.lottery_config?.winner_count || 1}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Prize Funding Source</span>
//                     <span className="font-medium capitalize">
//                       {(election.lottery_prize_funding_source || election.lottery_config?.prize_funding_source || 'N/A').replace('_', ' ')}
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Reward Type</span>
//                     <span className="font-medium capitalize">
//                       {(election.lottery_reward_type || election.lottery_config?.reward_type || 'N/A').replace('_', ' ')}
//                     </span>
//                   </div>
                  
//                   {(election.lottery_estimated_value || election.lottery_config?.estimated_value) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded border border-green-200">
//                       <span className="text-gray-600 font-medium">Estimated Prize Value</span>
//                       <span className="font-bold text-green-600 text-xl">
//                         ${parseFloat(election.lottery_estimated_value || election.lottery_config?.estimated_value).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
//                       <span className="text-gray-600 font-medium">Total Prize Pool</span>
//                       <span className="font-bold text-blue-600 text-xl">
//                         ${parseFloat(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded border border-purple-200">
//                       <span className="text-gray-600 font-medium">Revenue Share</span>
//                       <span className="font-bold text-purple-600 text-lg">
//                         {election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage}%
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_projected_revenue || election.lottery_config?.projected_revenue) && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded border border-indigo-200">
//                       <span className="text-gray-600 font-medium">Projected Revenue</span>
//                       <span className="font-bold text-indigo-600 text-xl">
//                         ${parseFloat(election.lottery_projected_revenue || election.lottery_config?.projected_revenue).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {(election.lottery_prize_description || election.lottery_config?.prize_description) && (
//                     <div className="p-4 bg-blue-50 rounded border border-blue-200">
//                       <span className="text-gray-700 block mb-2 font-semibold">Prize Description</span>
//                       <p className="text-gray-800 leading-relaxed">
//                         {election.lottery_prize_description || election.lottery_config?.prize_description}
//                       </p>
//                     </div>
//                   )}
                  
//                   {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution) && 
//                    (election.lottery_prize_distribution?.length > 0 || election.lottery_config?.prize_distribution?.length > 0) && (
//                     <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border-2 border-yellow-300">
//                       <h4 className="text-gray-700 font-bold mb-3 flex items-center gap-2">
//                         <FaTrophy className="text-yellow-600" />
//                         Prize Distribution by Rank
//                       </h4>
//                       <div className="space-y-3">
//                         {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution).map((prize, idx) => (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
//                             <div className="flex items-center gap-3">
//                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
//                                 prize.rank === 1 ? 'bg-yellow-500' : 
//                                 prize.rank === 2 ? 'bg-gray-400' : 
//                                 prize.rank === 3 ? 'bg-orange-600' : 
//                                 'bg-blue-500'
//                               }`}>
//                                 {prize.rank}
//                               </div>
//                               <div>
//                                 <p className="font-semibold text-gray-800">
//                                   {prize.rank === 1 ? '🥇 First Place' : 
//                                    prize.rank === 2 ? '🥈 Second Place' : 
//                                    prize.rank === 3 ? '🥉 Third Place' : 
//                                    `Rank ${prize.rank}`}
//                                 </p>
//                                 {prize.prize_description && (
//                                   <p className="text-sm text-gray-600">{prize.prize_description}</p>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <span className="font-bold text-green-600 text-lg">
//                                 ${parseFloat(prize.prize_value || 0).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No Gamification configured for this election</p>
//                   <p className="text-sm text-gray-500 mt-2">Gamification features can be added when creating an election</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete &quot;<strong>{election.title}</strong>&quot;? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// //last workable code only to modify edit and delete above code
// // import React, { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { useDispatch } from 'react-redux';
// // import { toast } from 'react-toastify';
// // import {
// //   FaArrowLeft,
// //   FaEdit,
// //   FaTrash,
// //   FaShare,
// //   FaCalendar,
// //   FaClock,
// //   FaGlobe,
// //   FaUsers,
// //   FaDollarSign,
// //   FaVoteYea,
// //   FaEye,
// //   FaImage,
// //   FaVideo,
// //   FaCheckCircle,
// //   FaTimesCircle,
// //   FaLock,
// //   FaUnlock,
// //   FaTrophy,
// //   FaMapMarkerAlt,
// //   FaBuilding,
// //   FaPlayCircle,
// // } from 'react-icons/fa';

// // import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
// // import { setCurrentElection } from '../../redux/slices/electionSlice';

// // export default function ElectionView() {

// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const dispatch = useDispatch();
  
// //   const [election, setElection] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState('overview');
// //   const [deleteModal, setDeleteModal] = useState(false);

// //   useEffect(() => {
// //     fetchElectionDetails();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [id]);

// //   const fetchElectionDetails = async () => {
// //     try {
// //       setLoading(true);
      
// //       const electionResponse = await getElection(id);
// //       console.log('✅ Election response:', electionResponse);
      
// //       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
// //       setElection(electionData);
      
// //       dispatch(setCurrentElection({
// //         ...electionData,
// //         currentStep: 4,
// //         completedSteps: [1, 2, 3, 4],
// //       }));
      
// //       if (electionData.questions && Array.isArray(electionData.questions)) {
// //         console.log('✅ Using questions from election response:', electionData.questions.length);
// //         setQuestions(electionData.questions);
// //       } else {
// //         try {
// //           const questionsResponse = await getElectionQuestions(id);
// //           const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
// //           console.log('✅ Fetched questions separately:', questionsData.length);
// //           setQuestions(questionsData);
// //         } catch (err) {
// //           console.log('❌ Questions not available:', err);
// //           setQuestions([]);
// //         }
// //       }
      
// //     } catch (error) {
// //       console.error('❌ Error fetching election:', error);
// //       toast.error('Failed to load election details');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     try {
// //       await deleteElection(id);
// //       toast.success('Election deleted successfully');
// //       navigate('/dashboard?tab=all-elections');
// //      /*eslint-disable*/
// //     } catch (error) {
// //       toast.error('Failed to delete election');
// //     }
// //   };

// //   const handleShare = () => {
// //     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
// //     navigator.clipboard.writeText(shareUrl);
// //     toast.success('Link copied to clipboard!');
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return 'N/A';
// //     return new Date(dateString).toLocaleString('en-US', {
// //       month: 'long',
// //       day: 'numeric',
// //       year: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit',
// //     });
// //   };

// //   const formatTime = (timeString) => {
// //     if (!timeString) return 'N/A';
// //     return timeString;
// //   };

// //   const getStatusBadge = (status) => {
// //     const configs = {
// //       draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaClock },
// //       published: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
// //       active: { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
// //       completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaCheckCircle },
// //       cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
// //     };
// //     return configs[status?.toLowerCase()] || configs.draft;
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
// //       </div>
// //     );
// //   }

// //   if (!election) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="text-center">
// //           <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
// //           <button
// //             onClick={() => navigate('/dashboard?tab=all-elections')}
// //             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //           >
// //             Go Back
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const statusConfig = getStatusBadge(election.status);
// //   const StatusIcon = statusConfig.icon;

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-8">
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         <div className="mb-6">
// //           <button
// //             // onClick={() => navigate('/dashboard?tab=all-elections')}
// //             onClick={() => navigate('/dashboard/all-elections')}
// //             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
// //           >
// //             <FaArrowLeft /> Back to Elections
// //           </button>

// //           <div className="bg-white rounded-lg shadow-md p-6">
// //             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// //               <div className="flex-1">
// //                 <div className="flex items-center gap-3 mb-2">
// //                   <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
// //                   <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
// //                     <StatusIcon className="text-xs" />
// //                     {election.status}
// //                   </span>
// //                 </div>
// //                 <p className="text-gray-600">{election.description}</p>
// //               </div>
              
// //               <div className="flex gap-2">
// //                 <button
// //                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
// //                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// //                 >
// //                   <FaEdit /> Edit
// //                 </button>
// //                 <button
// //                   onClick={handleShare}
// //                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
// //                 >
// //                   <FaShare /> Share
// //                 </button>
// //                 <button
// //                   onClick={() => setDeleteModal(true)}
// //                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
// //                 >
// //                   <FaTrash /> Delete
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
// //                   <FaVoteYea />
// //                   {election.vote_count || 0}
// //                 </div>
// //                 <p className="text-sm text-gray-600">Votes</p>
// //               </div>
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
// //                   <FaEye />
// //                   {election.view_count || 0}
// //                 </div>
// //                 <p className="text-sm text-gray-600">Views</p>
// //               </div>
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
// //                   <FaUsers />
// //                   {questions.length || 0}
// //                 </div>
// //                 <p className="text-sm text-gray-600">Questions</p>
// //               </div>
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1 relative group">
// //                   <FaDollarSign />
// //                   {election.is_free ? 'Free' : 
// //                     election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ?
// //                       (() => {
// //                         const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
// //                         const min = Math.min(...fees);
// //                         const max = Math.max(...fees);
// //                         return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
// //                       })()
// //                     : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`
// //                   }
                  
// //                   {!election.is_free && (
// //                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
// //                       <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
// //                         <div className="font-semibold mb-1 text-orange-300">
// //                           {election.pricing_type === 'regional_fee' ? '🌍 Regional Pricing' : 
// //                            election.pricing_type === 'general_fee' ? '💵 Fixed Fee' : 'Paid Election'}
// //                         </div>
// //                         {election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ? (
// //                           <div className="space-y-1">
// //                             {election.regional_pricing.slice(0, 5).map((region, idx) => (
// //                               <div key={idx} className="flex justify-between gap-3">
// //                                 <span>{region.region_name}</span>
// //                                 <span className="text-green-300 font-semibold">${parseFloat(region.participation_fee).toFixed(2)}</span>
// //                               </div>
// //                             ))}
// //                             {election.regional_pricing.length > 5 && (
// //                               <div className="text-gray-400 text-center pt-1">+{election.regional_pricing.length - 5} more</div>
// //                             )}
// //                           </div>
// //                         ) : (
// //                           <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
// //                         )}
// //                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
// //                           <div className="border-8 border-transparent border-t-gray-900"></div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //                 <p className="text-sm text-gray-600">
// //                   Fee {election.pricing_type === 'regional_fee' ? '(Regional)' : election.pricing_type === 'general_fee' ? '(Fixed)' : ''}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md mb-6">
// //           <div className="flex border-b border-gray-200 overflow-x-auto">
// //             {['overview', 'media', 'questions', 'settings', 'gamify'].map((tab) => (
// //               <button
// //                 key={tab}
// //                 onClick={() => setActiveTab(tab)}
// //                 className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
// //                   activeTab === tab
// //                     ? 'border-b-2 border-blue-600 text-blue-600'
// //                     : 'text-gray-600 hover:text-gray-800'
// //                 }`}
// //               >
// //                 {tab}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         <div className="space-y-6">
// //           {activeTab === 'overview' && (
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaCalendar className="text-blue-600" />
// //                   Schedule
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Start Date</p>
// //                     <p className="font-medium">{formatDate(election.start_date)}</p>
// //                     {election.start_time && <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>}
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">End Date</p>
// //                     <p className="font-medium">{formatDate(election.end_date)}</p>
// //                     {election.end_time && <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>}
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Timezone</p>
// //                     <p className="font-medium">{election.timezone || 'UTC'}</p>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaVoteYea className="text-purple-600" />
// //                   Voting Configuration
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Voting Type</p>
// //                     <p className="font-medium capitalize">{election.voting_type || 'Plurality'}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Live Results</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.show_live_results ? (
// //                         <>
// //                           <FaCheckCircle className="text-green-600" /> Enabled
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaTimesCircle className="text-red-600" /> Disabled
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Vote Editing</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.vote_editing_allowed ? (
// //                         <>
// //                           <FaCheckCircle className="text-green-600" /> Allowed
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaTimesCircle className="text-red-600" /> Not Allowed
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Biometric Required</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.biometric_required ? (
// //                         <>
// //                           <FaLock className="text-orange-600" /> Yes
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaUnlock className="text-green-600" /> No
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Anonymous Voting</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.anonymous_voting_enabled ? (
// //                         <>
// //                           <FaCheckCircle className="text-green-600" /> Enabled
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaTimesCircle className="text-red-600" /> Disabled
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaGlobe className="text-green-600" />
// //                   Access Control
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Permission Type</p>
// //                     <p className="font-medium capitalize">{election.permission_type?.replace('_', ' ') || 'Public'}</p>
// //                   </div>
// //                   {election.allowed_countries && election.allowed_countries.length > 0 ? (
// //                     <div>
// //                       <p className="text-sm text-gray-600 mb-2">Allowed Countries ({election.allowed_countries.length})</p>
// //                       <div className="flex flex-wrap gap-2">
// //                         {election.allowed_countries.map((country, idx) => (
// //                           <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
// //                             {country}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   ) : (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Allowed Countries</p>
// //                       <p className="font-medium">All Countries</p>
// //                     </div>
// //                   )}
// //                   {election.authentication_methods && election.authentication_methods.length > 0 && (
// //                     <div>
// //                       <p className="text-sm text-gray-600 mb-2">Authentication Methods</p>
// //                       <div className="flex flex-wrap gap-2">
// //                         {election.authentication_methods.map((method, idx) => (
// //                           <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded capitalize">
// //                             {method.replace('_', ' ')}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaDollarSign className="text-yellow-600" />
// //                   Pricing
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Type</p>
// //                     <p className="font-medium capitalize">
// //                       {election.is_free ? 'Free' : (election.pricing_type?.replace('_', ' ') || 'Paid')}
// //                     </p>
// //                   </div>
// //                   {!election.is_free && (
// //                     <>
// //                       {election.pricing_type === 'regional_fee' && election.regional_pricing && election.regional_pricing.length > 0 ? (
// //                         <div>
// //                           <p className="text-sm text-gray-600 mb-2">Regional Pricing</p>
// //                           <div className="space-y-2">
// //                             {election.regional_pricing.map((region, idx) => (
// //                               <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
// //                                 <span className="text-sm">{region.region_name}</span>
// //                                 <span className="font-semibold text-green-600">
// //                                   ${parseFloat(region.participation_fee).toFixed(2)} {region.currency}
// //                                 </span>
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </div>
// //                       ) : (
// //                         <div>
// //                           <p className="text-sm text-gray-600">Participation Fee</p>
// //                           <p className="font-medium text-2xl text-green-600">
// //                             ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
// //                           </p>
// //                         </div>
// //                       )}
// //                       {election.processing_fee_percentage > 0 && (
// //                         <div>
// //                           <p className="text-sm text-gray-600">Processing Fee</p>
// //                           <p className="font-medium">{election.processing_fee_percentage}%</p>
// //                         </div>
// //                       )}
// //                       {election.prize_pool && parseFloat(election.prize_pool) > 0 && (
// //                         <div>
// //                           <p className="text-sm text-gray-600">Prize Pool</p>
// //                           <p className="font-medium text-lg text-purple-600">
// //                             ${parseFloat(election.prize_pool).toFixed(2)}
// //                           </p>
// //                         </div>
// //                       )}
// //                     </>
// //                   )}
// //                 </div>
// //               </div>

// //               {(election.video_watch_required || 
// //                 election.required_watch_duration_minutes > 0 || 
// //                 (election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0) ||
// //                 election.minimum_watch_time > 0) && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaPlayCircle className="text-red-600" />
// //                     Video Watch Requirements
// //                   </h3>
// //                   <div className="space-y-3">
// //                     <div>
// //                       <p className="text-sm text-gray-600">Video Watch Required</p>
// //                       <p className="font-medium flex items-center gap-2">
// //                         {election.video_watch_required ? (
// //                           <>
// //                             <FaCheckCircle className="text-green-600" /> Yes
// //                           </>
// //                         ) : (
// //                           <>
// //                             <FaTimesCircle className="text-red-600" /> No
// //                           </>
// //                         )}
// //                       </p>
// //                     </div>
// //                     {election.required_watch_duration_minutes > 0 && (
// //                       <div>
// //                         <p className="text-sm text-gray-600">Required Watch Duration</p>
// //                         <p className="font-medium">{election.required_watch_duration_minutes} minutes</p>
// //                       </div>
// //                     )}
// //                     {election.minimum_watch_percentage && parseFloat(election.minimum_watch_percentage) > 0 && (
// //                       <div>
// //                         <p className="text-sm text-gray-600">Minimum Watch Percentage</p>
// //                         <p className="font-medium">{parseFloat(election.minimum_watch_percentage).toFixed(2)}%</p>
// //                       </div>
// //                     )}
// //                     {election.minimum_watch_time > 0 && (
// //                       <div>
// //                         <p className="text-sm text-gray-600">Minimum Watch Time</p>
// //                         <p className="font-medium">{election.minimum_watch_time} seconds</p>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaBuilding className="text-indigo-600" />
// //                   Creator Information 
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Creator Type</p>
// //                     <p className="font-medium capitalize">{election.creator_type || 'Individual'}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Creator ID</p>
// //                     <p className="font-medium">{election.creator_id}</p>
// //                   </div>
// //                   {election.organization_id && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Organization ID</p>
// //                       <p className="font-medium">{election.organization_id}</p>
// //                     </div>
// //                   )}
// //                   {election.category_id && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Category ID</p>
// //                       <p className="font-medium">{election.category_id}</p>
// //                     </div>
// //                   )}
// //                   {election.subscription_plan_id && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Subscription Plan ID</p>
// //                       <p className="font-medium">{election.subscription_plan_id}</p>
// //                     </div>
// //                   )}
// //                   <div>
// //                     <p className="text-sm text-gray-600">Created At</p>
// //                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
// //                   </div>
// //                   {election.updated_at && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Last Updated</p>
// //                       <p className="font-medium text-sm">{formatDate(election.updated_at)}</p>
// //                     </div>
// //                   )}
// //                   {election.published_at && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Published At</p>
// //                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaShare className="text-pink-600" />
// //                   URLs & Links 
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Slug</p>
// //                     <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.slug}</p>
// //                   </div>
// //                   {election.custom_url && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Custom URL</p>
// //                       <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{election.custom_url}</p>
// //                     </div>
// //                   )}
// //                   {election.shareable_url && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Shareable URL</p>
// //                       <a
// //                         href={election.shareable_url}
// //                         target="_blank"
// //                         rel="noopener noreferrer"
// //                         className="text-blue-600 hover:underline text-sm break-all block"
// //                       >
// //                         {election.shareable_url}
// //                       </a>
// //                     </div>
// //                   )}
// //                   <div>
// //                     <p className="text-sm text-gray-600">Public Link</p>
// //                     <a
// //                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                       className="text-blue-600 hover:underline text-sm break-all block"
// //                     >
// //                       https://prod-client-omega.vercel.app/vote/{election.slug}
// //                     </a>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {activeTab === 'media' && (
// //             <div className="space-y-6">
// //               {election.topic_image_url && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaImage className="text-blue-600" />
// //                     Topic Image
// //                   </h3>
// //                   <img
// //                     src={election.topic_image_url}
// //                     alt={election.title}
// //                     className="w-full max-h-96 object-contain rounded-lg"
// //                   />
// //                 </div>
// //               )}

// //               {(election.topic_video_url || election.video_url) && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaVideo className="text-red-600" />
// //                     Topic Video
// //                   </h3>
// //                   {(() => {
// //                     const videoUrl = election.topic_video_url || election.video_url;
                    
// //                     if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
// //                       let videoId = '';
                      
// //                       if (videoUrl.includes('youtube.com/watch?v=')) {
// //                         videoId = videoUrl.split('v=')[1]?.split('&')[0];
// //                       } else if (videoUrl.includes('youtu.be/')) {
// //                         videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
// //                       } else if (videoUrl.includes('youtube.com/embed/')) {
// //                         videoId = videoUrl.split('embed/')[1]?.split('?')[0];
// //                       }
                      
// //                       if (videoId) {
// //                         return (
// //                           <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
// //                             <iframe
// //                               className="absolute top-0 left-0 w-full h-full rounded-lg"
// //                               src={`https://www.youtube.com/embed/${videoId}`}
// //                               title="Election Video"
// //                               frameBorder="0"
// //                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
// //                               allowFullScreen
// //                             />
// //                           </div>
// //                         );
// //                       }
// //                     }
                    
// //                     return (
// //                       <video
// //                         controls
// //                         className="w-full rounded-lg"
// //                         src={videoUrl}
// //                       >
// //                         Your browser does not support the video tag.
// //                       </video>
// //                     );
// //                   })()}
// //                 </div>
// //               )}

// //               {election.logo_url && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaImage className="text-purple-600" />
// //                     Election Logo
// //                   </h3>
// //                   <img
// //                     src={election.logo_url}
// //                     alt="Logo"
// //                     className="max-h-48 object-contain"
// //                   />
// //                 </div>
// //               )}

// //               {election.voting_body_content && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4">
// //                     Voting Body Content
// //                   </h3>
// //                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
// //                 </div>
// //               )}

// //               {!election.topic_image_url && !election.topic_video_url && !election.video_url && !election.logo_url && !election.voting_body_content && (
// //                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
// //                   <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
// //                   <p className="text-gray-600">No media files uploaded</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {activeTab === 'questions' && (
// //             <div className="space-y-4">
// //               {questions.length > 0 ? (
// //                 questions.map((question, idx) => (
// //                   <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
// //                     <div className="flex items-start gap-4">
// //                       <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
// //                         {idx + 1}
// //                       </div>
// //                       <div className="flex-1">
// //                         <h4 className="text-lg font-semibold text-gray-800 mb-2">
// //                           {question.question_text}
// //                         </h4>
// //                         <div className="flex flex-wrap gap-2 mb-3">
// //                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
// //                             {question.question_type}
// //                           </span>
// //                           {question.is_required && (
// //                             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
// //                               Required
// //                             </span>
// //                           )}
// //                           {question.max_selections > 1 && (
// //                             <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
// //                               Max: {question.max_selections}
// //                             </span>
// //                           )}
// //                         </div>
// //                         {question.question_image_url && (
// //                           <img
// //                             src={question.question_image_url}
// //                             alt="Question"
// //                             className="max-h-48 object-contain mb-3 rounded"
// //                           />
// //                         )}
// //                         {question.options && question.options.length > 0 && (
// //                           <div className="space-y-2">
// //                             <p className="text-sm font-medium text-gray-700">Options:</p>
// //                             {question.options.map((option) => (
// //                               <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
// //                                 <span className="flex-1">{option.option_text}</span>
// //                                 {option.option_image_url && (
// //                                   <img src={option.option_image_url} alt="Option" className="h-8 w-8 object-cover rounded" />
// //                                 )}
// //                               </div>
// //                             ))}
// //                           </div>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))
// //               ) : (
// //                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
// //                   <FaVoteYea className="text-6xl text-gray-300 mx-auto mb-4" />
// //                   <p className="text-gray-600">No questions added yet</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {activeTab === 'settings' && (
// //             <div className="bg-white rounded-lg shadow-md p-6">
// //               <h3 className="text-lg font-bold text-gray-800 mb-4">Election Settings</h3>
// //               <div className="space-y-4">
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Show Live Results</span>
// //                   <span className="font-medium">{election.show_live_results ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Vote Editing Allowed</span>
// //                   <span className="font-medium">{election.vote_editing_allowed ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Biometric Required</span>
// //                   <span className="font-medium">{election.biometric_required ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Anonymous Voting</span>
// //                   <span className="font-medium">{election.anonymous_voting_enabled ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Video Watch Required</span>
// //                   <span className="font-medium">{election.video_watch_required ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 {election.corporate_style && (
// //                   <div className="p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600 block mb-2">Corporate Style</span>
// //                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}

// //           {activeTab === 'gamify' && (
// //             <div className="bg-white rounded-lg shadow-md p-6">
// //               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                 <FaTrophy className="text-yellow-600" />
// //                 Gamification Configuration 
// //               </h3>
              
// //               {(election.lottery_enabled || election.lottery_config?.lottery_enabled) ? (
// //                 <div className="space-y-4">
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
// //                     <span className="text-gray-700 font-medium">Lottery Status</span>
// //                     <span className="font-bold text-green-600 flex items-center gap-2">
// //                       <FaCheckCircle /> Active
// //                     </span>
// //                   </div>
                  
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600">Number of Winners</span>
// //                     <span className="font-medium text-lg">
// //                       {election.lottery_winner_count || election.lottery_config?.winner_count || 1}
// //                     </span>
// //                   </div>
                  
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600">Prize Funding Source</span>
// //                     <span className="font-medium capitalize">
// //                       {(election.lottery_prize_funding_source || election.lottery_config?.prize_funding_source || 'N/A').replace('_', ' ')}
// //                     </span>
// //                   </div>
                  
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600">Reward Type</span>
// //                     <span className="font-medium capitalize">
// //                       {(election.lottery_reward_type || election.lottery_config?.reward_type || 'N/A').replace('_', ' ')}
// //                     </span>
// //                   </div>
                  
// //                   {(election.lottery_estimated_value || election.lottery_config?.estimated_value) && (
// //                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded border border-green-200">
// //                       <span className="text-gray-600 font-medium">Estimated Prize Value</span>
// //                       <span className="font-bold text-green-600 text-xl">
// //                         ${parseFloat(election.lottery_estimated_value || election.lottery_config?.estimated_value).toFixed(2)}
// //                       </span>
// //                     </div>
// //                   )}
                  
// //                   {(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool) && (
// //                     <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
// //                       <span className="text-gray-600 font-medium">Total Prize Pool</span>
// //                       <span className="font-bold text-blue-600 text-xl">
// //                         ${parseFloat(election.lottery_total_prize_pool || election.lottery_config?.total_prize_pool).toFixed(2)}
// //                       </span>
// //                     </div>
// //                   )}
                  
// //                   {(election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage) && (
// //                     <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded border border-purple-200">
// //                       <span className="text-gray-600 font-medium">Revenue Share</span>
// //                       <span className="font-bold text-purple-600 text-lg">
// //                         {election.lottery_revenue_share_percentage || election.lottery_config?.revenue_share_percentage}%
// //                       </span>
// //                     </div>
// //                   )}
                  
// //                   {(election.lottery_projected_revenue || election.lottery_config?.projected_revenue) && (
// //                     <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded border border-indigo-200">
// //                       <span className="text-gray-600 font-medium">Projected Revenue</span>
// //                       <span className="font-bold text-indigo-600 text-xl">
// //                         ${parseFloat(election.lottery_projected_revenue || election.lottery_config?.projected_revenue).toFixed(2)}
// //                       </span>
// //                     </div>
// //                   )}
                  
// //                   {(election.lottery_prize_description || election.lottery_config?.prize_description) && (
// //                     <div className="p-4 bg-blue-50 rounded border border-blue-200">
// //                       <span className="text-gray-700 block mb-2 font-semibold">Prize Description</span>
// //                       <p className="text-gray-800 leading-relaxed">
// //                         {election.lottery_prize_description || election.lottery_config?.prize_description}
// //                       </p>
// //                     </div>
// //                   )}
                  
// //                   {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution) && 
// //                    (election.lottery_prize_distribution?.length > 0 || election.lottery_config?.prize_distribution?.length > 0) && (
// //                     <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border-2 border-yellow-300">
// //                       <h4 className="text-gray-700 font-bold mb-3 flex items-center gap-2">
// //                         <FaTrophy className="text-yellow-600" />
// //                         Prize Distribution by Rank
// //                       </h4>
// //                       <div className="space-y-3">
// //                         {(election.lottery_prize_distribution || election.lottery_config?.prize_distribution).map((prize, idx) => (
// //                           <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
// //                             <div className="flex items-center gap-3">
// //                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
// //                                 prize.rank === 1 ? 'bg-yellow-500' : 
// //                                 prize.rank === 2 ? 'bg-gray-400' : 
// //                                 prize.rank === 3 ? 'bg-orange-600' : 
// //                                 'bg-blue-500'
// //                               }`}>
// //                                 {prize.rank}
// //                               </div>
// //                               <div>
// //                                 <p className="font-semibold text-gray-800">
// //                                   {prize.rank === 1 ? '🥇 First Place' : 
// //                                    prize.rank === 2 ? '🥈 Second Place' : 
// //                                    prize.rank === 3 ? '🥉 Third Place' : 
// //                                    `Rank ${prize.rank}`}
// //                                 </p>
// //                                 {prize.prize_description && (
// //                                   <p className="text-sm text-gray-600">{prize.prize_description}</p>
// //                                 )}
// //                               </div>
// //                             </div>
// //                             <div className="text-right">
// //                               <span className="font-bold text-green-600 text-lg">
// //                                 ${parseFloat(prize.prize_value || 0).toFixed(2)}
// //                               </span>
// //                             </div>
// //                           </div>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div className="text-center py-12">
// //                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
// //                   <p className="text-gray-600 text-lg">No Gamification configured for this election</p>
// //                   <p className="text-sm text-gray-500 mt-2">Gamification features can be added when creating an election</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {deleteModal && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
// //             <div className="text-center mb-6">
// //               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
// //                 <FaTrash className="text-red-600 text-2xl" />
// //               </div>
// //               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
// //               <p className="text-gray-600">
// //                 Delete &quot;<strong>{election.title}</strong>&quot;? This cannot be undone.
// //               </p>
// //             </div>
// //             <div className="flex gap-3">
// //               <button
// //                 onClick={() => setDeleteModal(false)}
// //                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleDelete}
// //                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// //Last workbale code 
// // import React, { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { useDispatch } from 'react-redux';
// // import { toast } from 'react-toastify';
// // import {
// //   FaArrowLeft,
// //   FaEdit,
// //   FaTrash,
// //   FaShare,
// //   FaCalendar,
// //   FaClock,
// //   FaGlobe,
// //   FaUsers,
// //   FaDollarSign,
// //   FaVoteYea,
// //   FaEye,
// //   FaImage,
// //   FaVideo,
// //   FaCheckCircle,
// //   FaTimesCircle,
// //   FaLock,
// //   FaUnlock,
// //   FaTrophy,
// //   FaMapMarkerAlt,
// //   FaBuilding,
// //   FaPlayCircle,
// // } from 'react-icons/fa';

// // import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
// // import { setCurrentElection } from '../../redux/slices/electionSlice';

// // export default function ElectionView() {

// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const dispatch = useDispatch();
  
// //   const [election, setElection] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState('overview');
// //   const [deleteModal, setDeleteModal] = useState(false);

// //   useEffect(() => {
// //     fetchElectionDetails();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [id]);

// //   const fetchElectionDetails = async () => {
// //     try {
// //       setLoading(true);
      
// //       const electionResponse = await getElection(id);
// //       console.log('✅ Election response:', electionResponse);
      
// //       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
// //       setElection(electionData);
      
// //       dispatch(setCurrentElection({
// //         ...electionData,
// //         currentStep: 4,
// //         completedSteps: [1, 2, 3, 4],
// //       }));
      
// //       if (electionData.questions && Array.isArray(electionData.questions)) {
// //         console.log('✅ Using questions from election response:', electionData.questions.length);
// //         setQuestions(electionData.questions);
// //       } else {
// //         try {
// //           const questionsResponse = await getElectionQuestions(id);
// //           const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
// //           console.log('✅ Fetched questions separately:', questionsData.length);
// //           setQuestions(questionsData);
// //         } catch (err) {
// //           console.log('❌ Questions not available:', err);
// //           setQuestions([]);
// //         }
// //       }
      
// //     } catch (error) {
// //       console.error('❌ Error fetching election:', error);
// //       toast.error('Failed to load election details');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     try {
// //       await deleteElection(id);
// //       toast.success('Election deleted successfully');
// //       navigate('/dashboard?tab=all-elections');
// //       /*eslint-disable*/
// //     } catch (error) {
// //       toast.error('Failed to delete election');
// //     }
// //   };

// //   const handleShare = () => {
// //     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
// //     navigator.clipboard.writeText(shareUrl);
// //     toast.success('Link copied to clipboard!');
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return 'N/A';
// //     return new Date(dateString).toLocaleString('en-US', {
// //       month: 'long',
// //       day: 'numeric',
// //       year: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit',
// //     });
// //   };

// //   const formatTime = (timeString) => {
// //     if (!timeString) return 'N/A';
// //     return timeString;
// //   };

// //   const getStatusBadge = (status) => {
// //     const configs = {
// //       draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaClock },
// //       published: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FaCheckCircle },
// //       active: { bg: 'bg-green-100', text: 'text-green-700', icon: FaCheckCircle },
// //       completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FaCheckCircle },
// //       cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FaTimesCircle },
// //     };
// //     return configs[status?.toLowerCase()] || configs.draft;
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
// //       </div>
// //     );
// //   }

// //   if (!election) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="text-center">
// //           <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
// //           <button
// //             onClick={() => navigate('/dashboard?tab=all-elections')}
// //             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //           >
// //             Go Back
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const statusConfig = getStatusBadge(election.status);
// //   const StatusIcon = statusConfig.icon;

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-8">
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         {/* Header */}
// //         <div className="mb-6">
// //           <button
// //             onClick={() => navigate('/dashboard?tab=all-elections')}
// //             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
// //           >
// //             <FaArrowLeft /> Back to Elections
// //           </button>

// //           <div className="bg-white rounded-lg shadow-md p-6">
// //             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// //               <div className="flex-1">
// //                 <div className="flex items-center gap-3 mb-2">
// //                   <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
// //                   <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
// //                     <StatusIcon className="text-xs" />
// //                     {election.status}
// //                   </span>
// //                 </div>
// //                 <p className="text-gray-600">{election.description}</p>
// //               </div>
              
// //               <div className="flex gap-2">
// //                 <button
// //                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
// //                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// //                 >
// //                   <FaEdit /> Edit
// //                 </button>
// //                 <button
// //                   onClick={handleShare}
// //                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
// //                 >
// //                   <FaShare /> Share
// //                 </button>
// //                 <button
// //                   onClick={() => setDeleteModal(true)}
// //                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
// //                 >
// //                   <FaTrash /> Delete
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Stats */}
// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
// //                   <FaVoteYea />
// //                   {election.vote_count || 0}
// //                 </div>
// //                 <p className="text-sm text-gray-600">Votes</p>
// //               </div>
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
// //                   <FaEye />
// //                   {election.view_count || 0}
// //                 </div>
// //                 <p className="text-sm text-gray-600">Views</p>
// //               </div>
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
// //                   <FaUsers />
// //                   {questions.length || 0}
// //                 </div>
// //                 <p className="text-sm text-gray-600">Questions</p>
// //               </div>
// //               <div className="text-center">
// //                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1 relative group">
// //                   <FaDollarSign />
// //                   {election.is_free ? 'Free' : 
// //                     election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ?
// //                       (() => {
// //                         const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
// //                         const min = Math.min(...fees);
// //                         const max = Math.max(...fees);
// //                         return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
// //                       })()
// //                     : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`
// //                   }
                  
// //                   {/* Tooltip */}
// //                   {!election.is_free && (
// //                     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
// //                       <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
// //                         <div className="font-semibold mb-1 text-orange-300">
// //                           {election.pricing_type === 'regional_fee' ? '🌍 Regional Pricing' : 
// //                            election.pricing_type === 'general_fee' ? '💵 Fixed Fee' : 'Paid Election'}
// //                         </div>
// //                         {election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ? (
// //                           <div className="space-y-1">
// //                             {election.regional_pricing.slice(0, 5).map((region, idx) => (
// //                               <div key={idx} className="flex justify-between gap-3">
// //                                 <span>{region.region_name}</span>
// //                                 <span className="text-green-300 font-semibold">${parseFloat(region.participation_fee).toFixed(2)}</span>
// //                               </div>
// //                             ))}
// //                             {election.regional_pricing.length > 5 && (
// //                               <div className="text-gray-400 text-center pt-1">+{election.regional_pricing.length - 5} more</div>
// //                             )}
// //                           </div>
// //                         ) : (
// //                           <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
// //                         )}
// //                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
// //                           <div className="border-8 border-transparent border-t-gray-900"></div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //                 <p className="text-sm text-gray-600">
// //                   Fee {election.pricing_type === 'regional_fee' ? '(Regional)' : election.pricing_type === 'general_fee' ? '(Fixed)' : ''}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Tabs */}
// //         <div className="bg-white rounded-lg shadow-md mb-6">
// //           <div className="flex border-b border-gray-200 overflow-x-auto">
// //             {['overview', 'media', 'questions', 'settings', 'gamify'].map((tab) => (
// //               <button
// //                 key={tab}
// //                 onClick={() => setActiveTab(tab)}
// //                 className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
// //                   activeTab === tab
// //                     ? 'border-b-2 border-blue-600 text-blue-600'
// //                     : 'text-gray-600 hover:text-gray-800'
// //                 }`}
// //               >
// //                 {tab}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Tab Content */}
// //         <div className="space-y-6">
// //           {/* Overview Tab */}
// //           {activeTab === 'overview' && (
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //               {/* Schedule */}
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaCalendar className="text-blue-600" />
// //                   Schedule
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Start Date</p>
// //                     <p className="font-medium">{formatDate(election.start_date)}</p>
// //                     {election.start_time && <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>}
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">End Date</p>
// //                     <p className="font-medium">{formatDate(election.end_date)}</p>
// //                     {election.end_time && <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>}
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Timezone</p>
// //                     <p className="font-medium">{election.timezone || 'UTC'}</p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Voting Configuration */}
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaVoteYea className="text-purple-600" />
// //                   Voting Configuration
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Voting Type</p>
// //                     <p className="font-medium capitalize">{election.voting_type || 'Plurality'}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Live Results</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.show_live_results ? (
// //                         <>
// //                           <FaCheckCircle className="text-green-600" /> Enabled
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaTimesCircle className="text-red-600" /> Disabled
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Vote Editing</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.vote_editing_allowed ? (
// //                         <>
// //                           <FaCheckCircle className="text-green-600" /> Allowed
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaTimesCircle className="text-red-600" /> Not Allowed
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Biometric Required</p>
// //                     <p className="font-medium flex items-center gap-2">
// //                       {election.biometric_required ? (
// //                         <>
// //                           <FaLock className="text-orange-600" /> Yes
// //                         </>
// //                       ) : (
// //                         <>
// //                           <FaUnlock className="text-green-600" /> No
// //                         </>
// //                       )}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Access Control */}
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaGlobe className="text-green-600" />
// //                   Access Control
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Permission Type</p>
// //                     <p className="font-medium capitalize">{election.permission_type?.replace('_', ' ') || 'Public'}</p>
// //                   </div>
// //                   {election.allowed_countries && election.allowed_countries.length > 0 && (
// //                     <div>
// //                       <p className="text-sm text-gray-600 mb-2">Allowed Countries ({election.allowed_countries.length})</p>
// //                       <div className="flex flex-wrap gap-2">
// //                         {election.allowed_countries.map((country, idx) => (
// //                           <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
// //                             {country}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}
// //                   {election.authentication_methods && election.authentication_methods.length > 0 && (
// //                     <div>
// //                       <p className="text-sm text-gray-600 mb-2">Authentication Methods</p>
// //                       <div className="flex flex-wrap gap-2">
// //                         {election.authentication_methods.map((method, idx) => (
// //                           <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded capitalize">
// //                             {method.replace('_', ' ')}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               {/* Pricing */}
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaDollarSign className="text-yellow-600" />
// //                   Pricing
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Type</p>
// //                     <p className="font-medium capitalize">
// //                       {election.is_free ? 'Free' : (election.pricing_type?.replace('_', ' ') || 'Paid')}
// //                     </p>
// //                   </div>
// //                   {!election.is_free && (
// //                     <>
// //                       {election.pricing_type === 'regional_fee' && election.regional_pricing && election.regional_pricing.length > 0 ? (
// //                         <div>
// //                           <p className="text-sm text-gray-600 mb-2">Regional Pricing</p>
// //                           <div className="space-y-2">
// //                             {election.regional_pricing.map((region, idx) => (
// //                               <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
// //                                 <span className="text-sm">{region.region_name}</span>
// //                                 <span className="font-semibold text-green-600">
// //                                   ${parseFloat(region.participation_fee).toFixed(2)} {region.currency}
// //                                 </span>
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </div>
// //                       ) : (
// //                         <div>
// //                           <p className="text-sm text-gray-600">Participation Fee</p>
// //                           <p className="font-medium text-2xl text-green-600">
// //                             ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
// //                           </p>
// //                         </div>
// //                       )}
// //                       {election.processing_fee_percentage > 0 && (
// //                         <div>
// //                           <p className="text-sm text-gray-600">Processing Fee</p>
// //                           <p className="font-medium">{election.processing_fee_percentage}%</p>
// //                         </div>
// //                       )}
// //                     </>
// //                   )}
// //                 </div>
// //               </div>

// //               {/* Creator Info */}
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaBuilding className="text-indigo-600" />
// //                   Creator Information 
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Creator Type</p>
// //                     <p className="font-medium capitalize">{election.creator_type || 'Individual'}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-600">Creator ID</p>
// //                     <p className="font-medium">{election.creator_id}</p>
// //                   </div>
// //                   {election.organization_id && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Organization ID</p>
// //                       <p className="font-medium">{election.organization_id}</p>
// //                     </div>
// //                   )}
// //                   <div>
// //                     <p className="text-sm text-gray-600">Created At</p>
// //                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
// //                   </div>
// //                   {election.published_at && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Published At</p>
// //                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               {/* URLs & Links */}
// //               <div className="bg-white rounded-lg shadow-md p-6">
// //                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                   <FaShare className="text-pink-600" />
// //                   URLs & Links
// //                 </h3>
// //                 <div className="space-y-3">
// //                   <div>
// //                     <p className="text-sm text-gray-600">Slug</p>
// //                     <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
// //                   </div>
// //                   {election.custom_url && (
// //                     <div>
// //                       <p className="text-sm text-gray-600">Custom URL</p>
// //                       <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
// //                     </div>
// //                   )}
// //                   <div>
// //                     <p className="text-sm text-gray-600">Public Link</p>
// //                     <a
// //                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                       className="text-blue-600 hover:underline text-sm break-all"
// //                     >
// //                       https://prod-client-omega.vercel.app/vote/{election.slug}
// //                     </a>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {/* Media Tab */}
// //           {activeTab === 'media' && (
// //             <div className="space-y-6">
// //               {/* Topic Image */}
// //               {election.topic_image_url && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaImage className="text-blue-600" />
// //                     Topic Image
// //                   </h3>
// //                   <img
// //                     src={election.topic_image_url}
// //                     alt={election.title}
// //                     className="w-full max-h-96 object-contain rounded-lg"
// //                   />
// //                 </div>
// //               )}

// //               {/* Topic Video */}
// //               {election.topic_video_url && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaVideo className="text-red-600" />
// //                     Topic Video
// //                   </h3>
// //                   {(() => {
// //                     const videoUrl = election.topic_video_url;
                    
// //                     if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
// //                       let videoId = '';
                      
// //                       if (videoUrl.includes('youtube.com/watch?v=')) {
// //                         videoId = videoUrl.split('v=')[1]?.split('&')[0];
// //                       } else if (videoUrl.includes('youtu.be/')) {
// //                         videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
// //                       } else if (videoUrl.includes('youtube.com/embed/')) {
// //                         videoId = videoUrl.split('embed/')[1]?.split('?')[0];
// //                       }
                      
// //                       if (videoId) {
// //                         return (
// //                           <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
// //                             <iframe
// //                               className="absolute top-0 left-0 w-full h-full rounded-lg"
// //                               src={`https://www.youtube.com/embed/${videoId}`}
// //                               title="Election Video"
// //                               frameBorder="0"
// //                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
// //                               allowFullScreen
// //                             />
// //                           </div>
// //                         );
// //                       }
// //                     }
                    
// //                     return (
// //                       <video
// //                         controls
// //                         className="w-full rounded-lg"
// //                         src={videoUrl}
// //                       >
// //                         Your browser does not support the video tag.
// //                       </video>
// //                     );
// //                   })()}
// //                 </div>
// //               )}

// //               {/* Logo */}
// //               {election.logo_url && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                     <FaImage className="text-purple-600" />
// //                     Election Logo
// //                   </h3>
// //                   <img
// //                     src={election.logo_url}
// //                     alt="Logo"
// //                     className="max-h-48 object-contain"
// //                   />
// //                 </div>
// //               )}

// //               {/* Voting Body Content */}
// //               {election.voting_body_content && (
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                   <h3 className="text-lg font-bold text-gray-800 mb-4">
// //                     Voting Body Content
// //                   </h3>
// //                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
// //                 </div>
// //               )}

// //               {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
// //                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
// //                   <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
// //                   <p className="text-gray-600">No media files uploaded</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* Questions Tab */}
// //           {activeTab === 'questions' && (
// //             <div className="space-y-4">
// //               {questions.length > 0 ? (
// //                 questions.map((question, idx) => (
// //                   <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
// //                     <div className="flex items-start gap-4">
// //                       <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
// //                         {idx + 1}
// //                       </div>
// //                       <div className="flex-1">
// //                         <h4 className="text-lg font-semibold text-gray-800 mb-2">
// //                           {question.question_text}
// //                         </h4>
// //                         <div className="flex flex-wrap gap-2 mb-3">
// //                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
// //                             {question.question_type}
// //                           </span>
// //                           {question.is_required && (
// //                             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
// //                               Required
// //                             </span>
// //                           )}
// //                           {question.max_selections > 1 && (
// //                             <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
// //                               Max: {question.max_selections}
// //                             </span>
// //                           )}
// //                         </div>
// //                         {question.question_image_url && (
// //                           <img
// //                             src={question.question_image_url}
// //                             alt="Question"
// //                             className="max-h-48 object-contain mb-3 rounded"
// //                           />
// //                         )}
// //                         {question.options && question.options.length > 0 && (
// //                           <div className="space-y-2">
// //                             <p className="text-sm font-medium text-gray-700">Options:</p>
// //                             {question.options.map((option) => (
// //                               <div key={option.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
// //                                 <span className="flex-1">{option.option_text}</span>
// //                                 {option.option_image_url && (
// //                                   <img src={option.option_image_url} alt="Option" className="h-8 w-8 object-cover rounded" />
// //                                 )}
// //                               </div>
// //                             ))}
// //                           </div>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))
// //               ) : (
// //                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
// //                   <FaVoteYea className="text-6xl text-gray-300 mx-auto mb-4" />
// //                   <p className="text-gray-600">No questions added yet</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* Settings Tab */}
// //           {activeTab === 'settings' && (
// //             <div className="bg-white rounded-lg shadow-md p-6">
// //               <h3 className="text-lg font-bold text-gray-800 mb-4">Election Settings</h3>
// //               <div className="space-y-4">
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Show Live Results</span>
// //                   <span className="font-medium">{election.show_live_results ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Vote Editing Allowed</span>
// //                   <span className="font-medium">{election.vote_editing_allowed ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                   <span className="text-gray-600">Biometric Required</span>
// //                   <span className="font-medium">{election.biometric_required ? 'Yes' : 'No'}</span>
// //                 </div>
// //                 {election.corporate_style && (
// //                   <div className="p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600 block mb-2">Corporate Style</span>
// //                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}

// //           {/* Gamify Tab */}
// //           {activeTab === 'gamify' && (
// //             <div className="bg-white rounded-lg shadow-md p-6">
// //               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
// //                 <FaTrophy className="text-yellow-600" />
// //                 Gamification Configuration 
// //               </h3>
              
// //               {election.lottery_config && election.lottery_config.is_lotterized ? (
// //                 <div className="space-y-4">
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
// //                     <span className="text-gray-700 font-medium">Status</span>
// //                     <span className="font-bold text-green-600 flex items-center gap-2">
// //                       <FaCheckCircle /> Active
// //                     </span>
// //                   </div>
                  
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600">Winner Count</span>
// //                     <span className="font-medium">{election.lottery_config.winner_count || 1}</span>
// //                   </div>
                  
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600">Prize Funding Source</span>
// //                     <span className="font-medium capitalize">{election.lottery_config.prize_funding_source || 'N/A'}</span>
// //                   </div>
                  
// //                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
// //                     <span className="text-gray-600">Reward Type</span>
// //                     <span className="font-medium capitalize">{election.lottery_config.reward_type || 'N/A'}</span>
// //                   </div>
                  
// //                   {election.lottery_config.reward_amount && (
// //                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
// //                       <span className="text-gray-600">Reward Amount</span>
// //                       <span className="font-bold text-green-600 text-xl">
// //                         ${parseFloat(election.lottery_config.reward_amount).toFixed(2)}
// //                       </span>
// //                     </div>
// //                   )}
                  
// //                   {election.lottery_config.prize_description && (
// //                     <div className="p-4 bg-blue-50 rounded">
// //                       <span className="text-gray-600 block mb-2 font-medium">Prize Description</span>
// //                       <p className="text-gray-800">{election.lottery_config.prize_description}</p>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div className="text-center py-12">
// //                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
// //                   <p className="text-gray-600 text-lg">No Gamification configured for this election</p>
// //                   <p className="text-sm text-gray-500 mt-2">Gamification features can be added when creating an election</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Delete Confirmation Modal */}
// //       {deleteModal && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
// //             <div className="text-center mb-6">
// //               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
// //                 <FaTrash className="text-red-600 text-2xl" />
// //               </div>
// //               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
// //               <p className="text-gray-600">
// //                 Delete &quot;<strong>{election.title}</strong>&quot;? This cannot be undone.
// //               </p>
// //             </div>
// //             <div className="flex gap-3">
// //               <button
// //                 onClick={() => setDeleteModal(false)}
// //                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleDelete}
// //                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
