import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Import your existing API functions
//import { getElection, deleteElection, getElectionQuestions } from '../../../api/electionApi';
//import { setCurrentElection } from '../../../redux/slices/electionSlice';
import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
import { setCurrentElection } from '../../redux/slices/electionSlice';

export default function ElectionView() {

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [election, setElection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    fetchElectionDetails();
  }, [id]);

  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch election details
      const electionResponse = await getElection(id);
      console.log('✅ Election response:', electionResponse);
      
      // Handle both response formats
      const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
      setElection(electionData);
      
      // ⭐ Update Redux store with election data
      dispatch(setCurrentElection({
        ...electionData,
        currentStep: 4, // View mode
        completedSteps: [1, 2, 3, 4],
      }));
      
      // ⭐ Use questions from election data if available (backend now includes them)
      if (electionData.questions && Array.isArray(electionData.questions)) {
        console.log('✅ Using questions from election response:', electionData.questions.length);
        setQuestions(electionData.questions);
      } else {
        // Fallback: Fetch questions separately if not included
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
    try {
      await deleteElection(id);
      toast.success('Election deleted successfully');
      navigate('/dashboard?tab=all-elections');
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
            onClick={() => navigate('/dashboard?tab=all-elections')}
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
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard?tab=all-elections')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FaArrowLeft /> Back to Elections
          </button>

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
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaShare /> Share
                </button>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>

            {/* Stats */}
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
                  {election.is_free ? 'Free' : 
                    election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ?
                      (() => {
                        const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
                        const min = Math.min(...fees);
                        const max = Math.max(...fees);
                        return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
                      })()
                    : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`
                  }
                  
                  {/* Tooltip */}
                  {!election.is_free && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1 text-orange-300">
                          {election.pricing_type === 'regional_fee' ? '🌍 Regional Pricing' : 
                           election.pricing_type === 'general_fee' ? '💵 Fixed Fee' : 'Paid Election'}
                        </div>
                        {election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ? (
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
                        ) : (
                          <div className="text-green-300 font-semibold">${parseFloat(election.general_participation_fee || 0).toFixed(2)}</div>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-8 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Fee {election.pricing_type === 'regional_fee' ? '(Regional)' : election.pricing_type === 'general_fee' ? '(Fixed)' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['overview', 'media', 'questions', 'settings', 'lottery'].map((tab) => (
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
              {/* Schedule */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCalendar className="text-blue-600" />
                  Schedule
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{formatDate(election.start_date)}</p>
                    {election.start_time && <p className="text-sm text-gray-500">Time: {formatTime(election.start_time)}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{formatDate(election.end_date)}</p>
                    {election.end_time && <p className="text-sm text-gray-500">Time: {formatTime(election.end_time)}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Timezone</p>
                    <p className="font-medium">{election.timezone || 'UTC'}</p>
                  </div>
                </div>
              </div>

              {/* Voting Configuration */}
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
                </div>
              </div>

              {/* Access Control */}
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
                  {election.allowed_countries && election.allowed_countries.length > 0 && (
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

              {/* Pricing */}
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
                    </>
                  )}
                </div>
              </div>

              {/* Creator Info */}
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
                    <p className="font-medium">{election.creator_id}</p>
                  </div>
                  {election.organization_id && (
                    <div>
                      <p className="text-sm text-gray-600">Organization ID</p>
                      <p className="font-medium">{election.organization_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
                  </div>
                  {election.published_at && (
                    <div>
                      <p className="text-sm text-gray-600">Published At</p>
                      <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* URLs & Links */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaShare className="text-pink-600" />
                  URLs & Links
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Slug</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
                  </div>
                  {election.custom_url && (
                    <div>
                      <p className="text-sm text-gray-600">Custom URL</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Public Link</p>
                    <a
                      href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      https://prod-client-omega.vercel.app/vote/{election.slug}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Topic Image */}
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

              {/* Topic Video */}
              {election.topic_video_url && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaVideo className="text-red-600" />
                    Topic Video
                  </h3>
                  {(() => {
                    const videoUrl = election.topic_video_url;
                    
                    // Check if it's a YouTube URL
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                      let videoId = '';
                      
                      // Extract video ID from different YouTube URL formats
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
                    
                    // Regular video file
                    return (
                      <video
                        controls
                        className="w-full rounded-lg"
                        src={videoUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()}
                </div>
              )}

              {/* Logo */}
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

              {/* Voting Body Content */}
              {election.voting_body_content && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Voting Body Content
                  </h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
                </div>
              )}

              {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
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
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
                                  <img src={option.option_image_url} alt="Option" className="h-8 w-8 object-cover rounded" />
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
                {election.corporate_style && (
                  <div className="p-4 bg-gray-50 rounded">
                    <span className="text-gray-600 block mb-2">Corporate Style</span>
                    <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lottery Tab */}
          {activeTab === 'lottery' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-600" />
                Lottery Configuration
              </h3>
              
              {election.lottery_config && election.lottery_config.is_lotterized ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Status</span>
                    <span className="font-bold text-green-600 flex items-center gap-2">
                      <FaCheckCircle /> Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <span className="text-gray-600">Winner Count</span>
                    <span className="font-medium">{election.lottery_config.winner_count || 1}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <span className="text-gray-600">Prize Funding Source</span>
                    <span className="font-medium capitalize">{election.lottery_config.prize_funding_source || 'N/A'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <span className="text-gray-600">Reward Type</span>
                    <span className="font-medium capitalize">{election.lottery_config.reward_type || 'N/A'}</span>
                  </div>
                  
                  {election.lottery_config.reward_amount && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
                      <span className="text-gray-600">Reward Amount</span>
                      <span className="font-bold text-green-600 text-xl">
                        ${parseFloat(election.lottery_config.reward_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {election.lottery_config.prize_description && (
                    <div className="p-4 bg-blue-50 rounded">
                      <span className="text-gray-600 block mb-2 font-medium">Prize Description</span>
                      <p className="text-gray-800">{election.lottery_config.prize_description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No lottery configured for this election</p>
                  <p className="text-sm text-gray-500 mt-2">Lottery features can be added when creating an election</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
              <p className="text-gray-600">
                Delete "<strong>{election.title}</strong>"? This cannot be undone.
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
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
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

// // Import your existing API functions
// //import { getElection, deleteElection, getElectionQuestions } from '../../../api/electionApi';
// //import { setCurrentElection } from '../../../redux/slices/electionSlice';
// import { deleteElection, getElection, getElectionQuestions } from '../../redux/api/election/electionApi';
// import { setCurrentElection } from '../../redux/slices/electionSlice';

// export default function ElectionView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   useEffect(() => {
//     fetchElectionDetails();
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch election details
//       const electionResponse = await getElection(id);
//       console.log('✅ Election response:', electionResponse);
      
//       // Handle both response formats
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       // ⭐ Update Redux store with election data
//       dispatch(setCurrentElection({
//         ...electionData,
//         currentStep: 4, // View mode
//         completedSteps: [1, 2, 3, 4],
//       }));
      
//       // ⭐ Use questions from election data if available (backend now includes them)
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         console.log('✅ Using questions from election response:', electionData.questions.length);
//         setQuestions(electionData.questions);
//       } else {
//         // Fallback: Fetch questions separately if not included
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
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard?tab=all-elections');
//       /*eslint-disable*/
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
//             onClick={() => navigate('/dashboard?tab=all-elections')}
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
//         {/* Header */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate('/dashboard?tab=all-elections')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> Back to Elections
//           </button>

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
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <FaEdit /> Edit
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
//                 <button
//                   onClick={() => setDeleteModal(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <FaTrash /> Delete
//                 </button>
//               </div>
//             </div>

//             {/* Stats */}
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
                  
//                   {/* Tooltip */}
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

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'lottery'].map((tab) => (
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
//               {/* Schedule */}
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

//               {/* Voting Configuration */}
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
//                 </div>
//               </div>

//               {/* Access Control */}
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
//                   {election.allowed_countries && election.allowed_countries.length > 0 && (
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

//               {/* Pricing */}
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
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Creator Info */}
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
//                     <p className="font-medium">{election.creator_id}</p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* URLs & Links */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Media Tab */}
//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {/* Topic Image */}
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

//               {/* Topic Video */}
//               {election.topic_video_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   <video
//                     controls
//                     className="w-full rounded-lg"
//                     src={election.topic_video_url}
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               )}

//               {/* Logo */}
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

//               {/* Voting Body Content */}
//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
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
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Lottery Tab */}
//           {activeTab === 'lottery' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Lottery Configuration
//               </h3>
              
//               {election.lottery_config && election.lottery_config.is_lotterized ? (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
//                     <span className="text-gray-700 font-medium">Status</span>
//                     <span className="font-bold text-green-600 flex items-center gap-2">
//                       <FaCheckCircle /> Active
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Winner Count</span>
//                     <span className="font-medium">{election.lottery_config.winner_count || 1}</span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Prize Funding Source</span>
//                     <span className="font-medium capitalize">{election.lottery_config.prize_funding_source || 'N/A'}</span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Reward Type</span>
//                     <span className="font-medium capitalize">{election.lottery_config.reward_type || 'N/A'}</span>
//                   </div>
                  
//                   {election.lottery_config.reward_amount && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
//                       <span className="text-gray-600">Reward Amount</span>
//                       <span className="font-bold text-green-600 text-xl">
//                         ${parseFloat(election.lottery_config.reward_amount).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {election.lottery_config.prize_description && (
//                     <div className="p-4 bg-blue-50 rounded">
//                       <span className="text-gray-600 block mb-2 font-medium">Prize Description</span>
//                       <p className="text-gray-800">{election.lottery_config.prize_description}</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No lottery configured for this election</p>
//                   <p className="text-sm text-gray-500 mt-2">Lottery features can be added when creating an election</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{election.title}</strong>"? This cannot be undone.
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
//last workable code
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
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

// // Import your existing API functions
// //import { getElection, deleteElection, getElectionQuestions } from '../../../api/electionApi';

// export default function ElectionView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   useEffect(() => {
//     fetchElectionDetails();
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch election details
//       const electionResponse = await getElection(id);
//       console.log('✅ Election response:', electionResponse);
      
//       // Handle both response formats
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       // ⭐ Use questions from election data if available (backend now includes them)
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         console.log('✅ Using questions from election response:', electionData.questions.length);
//         setQuestions(electionData.questions);
//       } else {
//         // Fallback: Fetch questions separately if not included
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
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard?tab=all-elections');
//       /*eslint-disable*/
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
//             onClick={() => navigate('/dashboard?tab=all-elections')}
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
//         {/* Header */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate('/dashboard?tab=all-elections')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> Back to Elections
//           </button>

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
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <FaEdit /> Edit
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
//                 <button
//                   onClick={() => setDeleteModal(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <FaTrash /> Delete
//                 </button>
//               </div>
//             </div>

//             {/* Stats */}
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
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1">
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
//                 </div>
//                 <p className="text-sm text-gray-600">Fee</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'lottery'].map((tab) => (
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
//               {/* Schedule */}
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

//               {/* Voting Configuration */}
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
//                 </div>
//               </div>

//               {/* Access Control */}
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
//                   {election.allowed_countries && election.allowed_countries.length > 0 && (
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

//               {/* Pricing */}
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
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Creator Info */}
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
//                     <p className="font-medium">{election.creator_id}</p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* URLs & Links */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Media Tab */}
//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {/* Topic Image */}
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

//               {/* Topic Video */}
//               {election.topic_video_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   <video
//                     controls
//                     className="w-full rounded-lg"
//                     src={election.topic_video_url}
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               )}

//               {/* Logo */}
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

//               {/* Voting Body Content */}
//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
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
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Lottery Tab */}
//           {activeTab === 'lottery' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Lottery Configuration
//               </h3>
              
//               {election.lottery_config && election.lottery_config.is_lotterized ? (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
//                     <span className="text-gray-700 font-medium">Status</span>
//                     <span className="font-bold text-green-600 flex items-center gap-2">
//                       <FaCheckCircle /> Active
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Winner Count</span>
//                     <span className="font-medium">{election.lottery_config.winner_count || 1}</span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Prize Funding Source</span>
//                     <span className="font-medium capitalize">{election.lottery_config.prize_funding_source || 'N/A'}</span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Reward Type</span>
//                     <span className="font-medium capitalize">{election.lottery_config.reward_type || 'N/A'}</span>
//                   </div>
                  
//                   {election.lottery_config.reward_amount && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
//                       <span className="text-gray-600">Reward Amount</span>
//                       <span className="font-bold text-green-600 text-xl">
//                         ${parseFloat(election.lottery_config.reward_amount).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {election.lottery_config.prize_description && (
//                     <div className="p-4 bg-blue-50 rounded">
//                       <span className="text-gray-600 block mb-2 font-medium">Prize Description</span>
//                       <p className="text-gray-800">{election.lottery_config.prize_description}</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No lottery configured for this election</p>
//                   <p className="text-sm text-gray-500 mt-2">Lottery features can be added when creating an election</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{election.title}</strong>"? This cannot be undone.
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
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
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

// // Import your existing API functions
// //import { getElection, deleteElection, getElectionQuestions } from '../../../api/electionApi';

// export default function ElectionView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   useEffect(() => {
//     fetchElectionDetails();
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch election details
//       const electionResponse = await getElection(id);
//       console.log('✅ Election response:', electionResponse);
      
//       // Handle both response formats
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       // ⭐ Use questions from election data if available (backend now includes them)
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         console.log('✅ Using questions from election response:', electionData.questions.length);
//         setQuestions(electionData.questions);
//       } else {
//         // Fallback: Fetch questions separately if not included
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
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard?tab=all-elections');
//       /*eslint-disable*/
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
//             onClick={() => navigate('/dashboard?tab=all-elections')}
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
//         {/* Header */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate('/dashboard?tab=all-elections')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> Back to Elections
//           </button>

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
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <FaEdit /> Edit
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
//                 <button
//                   onClick={() => setDeleteModal(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <FaTrash /> Delete
//                 </button>
//               </div>
//             </div>

//             {/* Stats */}
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
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1">
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
//                 </div>
//                 <p className="text-sm text-gray-600">Fee</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'lottery'].map((tab) => (
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
//               {/* Schedule */}
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

//               {/* Voting Configuration */}
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
//                 </div>
//               </div>

//               {/* Access Control */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaGlobe className="text-green-600" />
//                   Access Control
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Permission Type</p>
//                     <p className="font-medium capitalize">{election.permission_type || 'Public'}</p>
//                   </div>
//                   {election.allowed_countries && election.allowed_countries.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600">Allowed Countries</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {election.allowed_countries.map((country, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
//                             {country}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {election.authentication_methods && (
//                     <div>
//                       <p className="text-sm text-gray-600">Authentication Methods</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {election.authentication_methods.map((method, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
//                             {method}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaDollarSign className="text-yellow-600" />
//                   Pricing
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Type</p>
//                     <p className="font-medium">
//                       {election.is_free ? 'Free' : (election.pricing_type || 'Paid')}
//                     </p>
//                   </div>
//                   {!election.is_free && (
//                     <>
//                       <div>
//                         <p className="text-sm text-gray-600">Participation Fee</p>
//                         <p className="font-medium text-2xl text-green-600">
//                           ${election.general_participation_fee || '0.00'}
//                         </p>
//                       </div>
//                       {election.processing_fee_percentage > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Processing Fee</p>
//                           <p className="font-medium">{election.processing_fee_percentage}%</p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Creator Info */}
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
//                     <p className="font-medium">{election.creator_id}</p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* URLs & Links */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Media Tab */}
//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {/* Topic Image */}
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

//               {/* Topic Video */}
//               {election.topic_video_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   <video
//                     controls
//                     className="w-full rounded-lg"
//                     src={election.topic_video_url}
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               )}

//               {/* Logo */}
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

//               {/* Voting Body Content */}
//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
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
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Lottery Tab */}
//           {activeTab === 'lottery' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Lottery Configuration
//               </h3>
              
//               {election.lottery_config && election.lottery_config.is_lotterized ? (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
//                     <span className="text-gray-700 font-medium">Status</span>
//                     <span className="font-bold text-green-600 flex items-center gap-2">
//                       <FaCheckCircle /> Active
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Winner Count</span>
//                     <span className="font-medium">{election.lottery_config.winner_count || 1}</span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Prize Funding Source</span>
//                     <span className="font-medium capitalize">{election.lottery_config.prize_funding_source || 'N/A'}</span>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600">Reward Type</span>
//                     <span className="font-medium capitalize">{election.lottery_config.reward_type || 'N/A'}</span>
//                   </div>
                  
//                   {election.lottery_config.reward_amount && (
//                     <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded">
//                       <span className="text-gray-600">Reward Amount</span>
//                       <span className="font-bold text-green-600 text-xl">
//                         ${parseFloat(election.lottery_config.reward_amount).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
                  
//                   {election.lottery_config.prize_description && (
//                     <div className="p-4 bg-blue-50 rounded">
//                       <span className="text-gray-600 block mb-2 font-medium">Prize Description</span>
//                       <p className="text-gray-800">{election.lottery_config.prize_description}</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No lottery configured for this election</p>
//                   <p className="text-sm text-gray-500 mt-2">Lottery features can be added when creating an election</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{election.title}</strong>"? This cannot be undone.
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
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaArrowLeft,
//   FaEdit,
//   FaTrash,
//   FaShare,
//   FaCalendar,
//   FaGlobe,
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
//   FaBuilding,
// } from 'react-icons/fa';
// import { getElection, getElectionQuestions } from '../../redux/api/election/electionApi';

// //import { getElection, deleteElection, getElectionQuestions } from '../../../api/electionApi';

// export default function ElectionView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   useEffect(() => {
//     fetchElectionDetails();
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       const electionResponse = await getElection(id);
//       let electionData = null;
      
//       if (electionResponse.data) {
//         electionData = electionResponse.data.election || electionResponse.data;
//       } else if (electionResponse.election) {
//         electionData = electionResponse.election;
//       } else {
//         electionData = electionResponse;
//       }
      
//       setElection(electionData);
      
//       try {
//         const questionsResponse = await getElectionQuestions(id);
//         let questionsData = [];
        
//         if (questionsResponse.data) {
//           questionsData = questionsResponse.data.questions || questionsResponse.data || [];
//         } else if (questionsResponse.questions) {
//           questionsData = questionsResponse.questions;
//         } else if (Array.isArray(questionsResponse)) {
//           questionsData = questionsResponse;
//         }
        
//         setQuestions(questionsData);
//         /*eslint-disable*/
//       } catch (err) {
//         console.log('Questions not available');
//         setQuestions([]);
//       }
      
//     } catch (error) {
//       console.error('Error fetching election:', error);
//       toast.error('Failed to load election details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard?tab=all-elections');
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

//   const getMediaUrl = (mediaUrl) => {
//     if (!mediaUrl) return null;
    
//     if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
//       return mediaUrl;
//     }
    
//     const backendUrl = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005';
//     const baseUrl = backendUrl.replace('/api', '');
//     const cleanPath = mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`;
    
//     return `${baseUrl}${cleanPath}`;
//   };

//   const getVideoType = (videoUrl) => {
//     if (!videoUrl) return 'video/mp4';
    
//     const extension = videoUrl.split('.').pop().toLowerCase();
//     const types = {
//       'mp4': 'video/mp4',
//       'webm': 'video/webm',
//       'ogg': 'video/ogg',
//       'mov': 'video/quicktime',
//     };
    
//     return types[extension] || 'video/mp4';
//   };

//   // ⭐ YouTube Video Rendering
//   const renderVideo = (videoUrl) => {
//     if (!videoUrl) return null;
    
//     // Check if it's a YouTube URL
//     if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
//       let videoId = '';
      
//       // Extract video ID from different YouTube URL formats
//       if (videoUrl.includes('youtube.com/watch?v=')) {
//         videoId = videoUrl.split('v=')[1]?.split('&')[0];
//       } else if (videoUrl.includes('youtu.be/')) {
//         videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
//       } else if (videoUrl.includes('youtube.com/embed/')) {
//         videoId = videoUrl.split('embed/')[1]?.split('?')[0];
//       }
      
//       if (videoId) {
//         return (
//           <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
//             <iframe
//               className="absolute top-0 left-0 w-full h-full rounded-lg"
//               src={`https://www.youtube.com/embed/${videoId}`}
//               title="Election Video"
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             />
//           </div>
//         );
//       }
//     }
    
//     // Regular video file
//     return (
//       <video
//         controls
//         className="w-full rounded-lg"
//         controlsList="nodownload"
//         onError={(e) => {
//           console.error('Video failed to load:', getMediaUrl(videoUrl));
//         }}
//       >
//         <source 
//           src={getMediaUrl(videoUrl)} 
//           type={getVideoType(videoUrl)}
//         />
//         Your browser does not support the video tag.
//       </video>
//     );
//   };

//   const getStatusBadge = (status) => {
//     const configs = {
//       draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FaCheckCircle },
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
//             onClick={() => navigate('/dashboard?tab=all-elections')}
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
  
//   const voteCount = parseInt(election.vote_count) || 0;
//   const viewCount = parseInt(election.view_count) || 0;
//   const questionCount = questions.length || 0;
//   const fee = election.is_free ? 'Free' : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate('/dashboard?tab=all-elections')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> Back to Elections
//           </button>

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
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <FaEdit /> Edit
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
//                 <button
//                   onClick={() => setDeleteModal(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <FaTrash /> Delete
//                 </button>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-1">
//                   <FaVoteYea />
//                   {voteCount}
//                 </div>
//                 <p className="text-sm text-gray-600">Votes</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-purple-600 mb-1">
//                   <FaEye />
//                   {viewCount}
//                 </div>
//                 <p className="text-sm text-gray-600">Views</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600 mb-1">
//                   <FaVoteYea />
//                   {questionCount}
//                 </div>
//                 <p className="text-sm text-gray-600">Questions</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1">
//                   <FaDollarSign />
//                   {fee}
//                 </div>
//                 <p className="text-sm text-gray-600">Fee</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'lottery'].map((tab) => (
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
//               {/* Schedule */}
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

//               {/* Voting Configuration */}
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
//                 </div>
//               </div>

//               {/* Access Control */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaGlobe className="text-green-600" />
//                   Access Control
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Permission Type</p>
//                     <p className="font-medium capitalize">{election.permission_type || 'Public'}</p>
//                   </div>
//                   {election.allowed_countries && election.allowed_countries.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600">Allowed Countries</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {election.allowed_countries.map((country, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
//                             {country}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {election.authentication_methods && (
//                     <div>
//                       <p className="text-sm text-gray-600">Authentication Methods</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {election.authentication_methods.map((method, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
//                             {method}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaDollarSign className="text-yellow-600" />
//                   Pricing
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Type</p>
//                     <p className="font-medium">
//                       {election.is_free ? 'Free' : (election.pricing_type || 'Paid')}
//                     </p>
//                   </div>
//                   {!election.is_free && (
//                     <>
//                       <div>
//                         <p className="text-sm text-gray-600">Participation Fee</p>
//                         <p className="font-medium text-2xl text-green-600">
//                           ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
//                         </p>
//                       </div>
//                       {election.processing_fee_percentage > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Processing Fee</p>
//                           <p className="font-medium">{election.processing_fee_percentage}%</p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Creator Info */}
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
//                     <p className="font-medium">{election.creator_id}</p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* URLs & Links */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Media Tab */}
//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {/* Topic Image */}
//               {election.topic_image_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-blue-600" />
//                     Topic Image
//                   </h3>
//                   <img
//                     src={getMediaUrl(election.topic_image_url)}
//                     alt={election.title}
//                     className="w-full max-h-96 object-contain rounded-lg"
//                     onError={(e) => {
//                       console.error('Image failed to load:', getMediaUrl(election.topic_image_url));
//                       e.target.style.display = 'none';
//                     }}
//                   />
//                 </div>
//               )}

//               {/* Topic Video with YouTube Support */}
//               {election.topic_video_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   {renderVideo(election.topic_video_url)}
//                 </div>
//               )}

//               {/* Logo */}
//               {election.logo_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaImage className="text-purple-600" />
//                     Election Logo
//                   </h3>
//                   <img
//                     src={getMediaUrl(election.logo_url)}
//                     alt="Logo"
//                     className="max-h-48 object-contain"
//                     onError={(e) => {
//                       console.error('Logo failed to load:', getMediaUrl(election.logo_url));
//                       e.target.style.display = 'none';
//                     }}
//                   />
//                 </div>
//               )}

//               {/* Voting Body Content */}
//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
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
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
//                             src={getMediaUrl(question.question_image_url)}
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
//                                     src={getMediaUrl(option.option_image_url)} 
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
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Lottery Tab */}
//           {activeTab === 'lottery' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Lottery Configuration
//               </h3>
//               <div className="text-center py-8">
//                 <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-600">Lottery feature configuration will be displayed here</p>
//                 <p className="text-sm text-gray-500 mt-2">This requires the lottery_config table data</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{election.title}</strong>"? This cannot be undone.
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
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
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

// // Import your existing API functions
// //import { getElection, deleteElection, getElectionQuestions } from '../../../api/electionApi';

// export default function ElectionView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [election, setElection] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [deleteModal, setDeleteModal] = useState(false);

//   useEffect(() => {
//     fetchElectionDetails();
//   }, [id]);

//   const fetchElectionDetails = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch election details
//       const electionResponse = await getElection(id);
//       console.log('Election response:', electionResponse);
      
//       // Handle both response formats
//       const electionData = electionResponse.data?.election || electionResponse.data || electionResponse.election || electionResponse;
//       setElection(electionData);
      
//       // Fetch questions if available
//       try {
//         const questionsResponse = await getElectionQuestions(id);
//         const questionsData = questionsResponse.data?.questions || questionsResponse.data || questionsResponse.questions || questionsResponse || [];
//         setQuestions(questionsData);
//       } catch (err) {
//         console.log('Questions not available:', err);
//       }
      
//     } catch (error) {
//       console.error('Error fetching election:', error);
//       toast.error('Failed to load election details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await deleteElection(id);
//       toast.success('Election deleted successfully');
//       navigate('/dashboard?tab=all-elections');
//       /*eslint-disable*/
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
//             onClick={() => navigate('/dashboard?tab=all-elections')}
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
//         {/* Header */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate('/dashboard?tab=all-elections')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
//           >
//             <FaArrowLeft /> Back to Elections
//           </button>

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
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate(`/dashboard?tab=create-election&edit=${election.id}`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <FaEdit /> Edit
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <FaShare /> Share
//                 </button>
//                 <button
//                   onClick={() => setDeleteModal(true)}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <FaTrash /> Delete
//                 </button>
//               </div>
//             </div>

//             {/* Stats */}
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
//                 <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600 mb-1">
//                   <FaDollarSign />
//                   {election.is_free ? 'Free' : `$${election.general_participation_fee || 0}`}
//                 </div>
//                 <p className="text-sm text-gray-600">Fee</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md mb-6">
//           <div className="flex border-b border-gray-200 overflow-x-auto">
//             {['overview', 'media', 'questions', 'settings', 'lottery'].map((tab) => (
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
//               {/* Schedule */}
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

//               {/* Voting Configuration */}
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
//                 </div>
//               </div>

//               {/* Access Control */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaGlobe className="text-green-600" />
//                   Access Control
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Permission Type</p>
//                     <p className="font-medium capitalize">{election.permission_type || 'Public'}</p>
//                   </div>
//                   {election.allowed_countries && election.allowed_countries.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600">Allowed Countries</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {election.allowed_countries.map((country, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
//                             {country}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {election.authentication_methods && (
//                     <div>
//                       <p className="text-sm text-gray-600">Authentication Methods</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {election.authentication_methods.map((method, idx) => (
//                           <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded capitalize">
//                             {method}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaDollarSign className="text-yellow-600" />
//                   Pricing
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Type</p>
//                     <p className="font-medium">
//                       {election.is_free ? 'Free' : (election.pricing_type || 'Paid')}
//                     </p>
//                   </div>
//                   {!election.is_free && (
//                     <>
//                       <div>
//                         <p className="text-sm text-gray-600">Participation Fee</p>
//                         <p className="font-medium text-2xl text-green-600">
//                           ${election.general_participation_fee || '0.00'}
//                         </p>
//                       </div>
//                       {election.processing_fee_percentage > 0 && (
//                         <div>
//                           <p className="text-sm text-gray-600">Processing Fee</p>
//                           <p className="font-medium">{election.processing_fee_percentage}%</p>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Creator Info */}
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
//                     <p className="font-medium">{election.creator_id}</p>
//                   </div>
//                   {election.organization_id && (
//                     <div>
//                       <p className="text-sm text-gray-600">Organization ID</p>
//                       <p className="font-medium">{election.organization_id}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Created At</p>
//                     <p className="font-medium text-sm">{formatDate(election.created_at)}</p>
//                   </div>
//                   {election.published_at && (
//                     <div>
//                       <p className="text-sm text-gray-600">Published At</p>
//                       <p className="font-medium text-sm">{formatDate(election.published_at)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* URLs & Links */}
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <FaShare className="text-pink-600" />
//                   URLs & Links
//                 </h3>
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">Slug</p>
//                     <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.slug}</p>
//                   </div>
//                   {election.custom_url && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom URL</p>
//                       <p className="font-mono text-sm bg-gray-100 p-2 rounded">{election.custom_url}</p>
//                     </div>
//                   )}
//                   <div>
//                     <p className="text-sm text-gray-600">Public Link</p>
//                     <a
//                       href={`https://prod-client-omega.vercel.app/vote/${election.slug}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline text-sm break-all"
//                     >
//                       https://prod-client-omega.vercel.app/vote/{election.slug}
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Media Tab */}
//           {activeTab === 'media' && (
//             <div className="space-y-6">
//               {/* Topic Image */}
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

//               {/* Topic Video */}
//               {election.topic_video_url && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <FaVideo className="text-red-600" />
//                     Topic Video
//                   </h3>
//                   <video
//                     controls
//                     className="w-full rounded-lg"
//                     src={election.topic_video_url}
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               )}

//               {/* Logo */}
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

//               {/* Voting Body Content */}
//               {election.voting_body_content && (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4">
//                     Voting Body Content
//                   </h3>
//                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
//                 </div>
//               )}

//               {!election.topic_image_url && !election.topic_video_url && !election.logo_url && !election.voting_body_content && (
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
//                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
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
//                 {election.corporate_style && (
//                   <div className="p-4 bg-gray-50 rounded">
//                     <span className="text-gray-600 block mb-2">Corporate Style</span>
//                     <pre className="text-xs overflow-auto">{JSON.stringify(election.corporate_style, null, 2)}</pre>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Lottery Tab */}
//           {activeTab === 'lottery' && (
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <FaTrophy className="text-yellow-600" />
//                 Lottery Configuration
//               </h3>
//               <div className="text-center py-8">
//                 <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-600">Lottery feature configuration will be displayed here</p>
//                 <p className="text-sm text-gray-500 mt-2">This requires the lottery_config table data</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {deleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{election.title}</strong>"? This cannot be undone.
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