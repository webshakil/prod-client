import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCalendar,
  FaClock,
  FaGlobe,
  FaDollarSign,
  FaVoteYea,
  FaImage,
  FaVideo,
  FaCheckCircle,
  FaLock,
  FaUsers,
  FaShare,
} from 'react-icons/fa';
import { getElectionBySlug } from '../../redux/api/election/electionApi';

export default function VotingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchElectionData();
  }, [slug]);

  const fetchElectionData = async () => {
    try {
      setLoading(true);
      
      const response = await getElectionBySlug(slug);
      const electionData = response.data?.election || response.data || response;
      
      setElection(electionData);
      setQuestions(electionData.questions || []);
      
    } catch (error) {
      console.error('Error fetching election:', error);
      toast.error('Election not found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitVote = () => {
    toast.info('Voting functionality will be implemented soon!');
    console.log('Answers:', answers);
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

  const renderVideo = (videoUrl) => {
    if (!videoUrl) return null;
    
    // Check if it's a YouTube URL
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
    
    // Regular video file
    return (
      <video controls className="w-full rounded-lg">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h2>
          <p className="text-gray-600 mb-6">The election you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const fee = election.is_free ? 'Free' : 
    election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 ?
      (() => {
        const fees = election.regional_pricing.map(r => parseFloat(r.participation_fee));
        const min = Math.min(...fees);
        const max = Math.max(...fees);
        return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}-$${max.toFixed(2)}`;
      })()
    : `$${parseFloat(election.general_participation_fee || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.title}</h1>
              <p className="text-gray-600">{election.description}</p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaShare /> Share
            </button>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-blue-600 mb-1">
                <FaCalendar />
                <span className="text-sm">Ends</span>
              </div>
              <p className="text-xs text-gray-600">{formatDate(election.end_date)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 mb-1">
                <FaUsers />
                {questions.length}
              </div>
              <p className="text-xs text-gray-600">Questions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-orange-600 mb-1">
                <FaDollarSign />
                {fee}
              </div>
              <p className="text-xs text-gray-600">Fee</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-purple-600 mb-1">
                <FaCheckCircle />
                {election.status}
              </div>
              <p className="text-xs text-gray-600">Status</p>
            </div>
          </div>
        </div>

        {/* Media Section */}
        {(election.topic_image_url || election.topic_video_url) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {election.topic_image_url && (
              <div className="mb-4">
                <img
                  src={election.topic_image_url}
                  alt={election.title}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}
            {election.topic_video_url && (
              <div>
                {renderVideo(election.topic_video_url)}
              </div>
            )}
          </div>
        )}

        {/* Voting Body Content */}
        {election.voting_body_content && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: election.voting_body_content }} />
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Questions</h2>
            {questions.map((question, idx) => (
              <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {question.question_text}
                      {question.is_required && <span className="text-red-600 ml-1">*</span>}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Type: {question.question_type} | Max selections: {question.max_selections}
                    </p>
                  </div>
                </div>

                {/* Question Image */}
                {question.question_image_url && (
                  <img
                    src={question.question_image_url}
                    alt="Question"
                    className="w-full max-h-64 object-contain rounded mb-4"
                  />
                )}

                {/* Options */}
                {question.options && question.options.length > 0 && (
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                      >
                        <input
                          type={question.max_selections > 1 ? 'checkbox' : 'radio'}
                          name={`question_${question.id}`}
                          value={option.id}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="flex-1 font-medium">{option.option_text}</span>
                        {option.option_image_url && (
                          <img
                            src={option.option_image_url}
                            alt="Option"
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* Text Input for open-ended questions */}
                {question.question_type === 'text' && (
                  <textarea
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows="4"
                    placeholder="Enter your answer here..."
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleSubmitVote}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaVoteYea />
              Submit Your Vote
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              {election.biometric_required && <><FaLock className="inline mr-1" />Biometric verification required</>}
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Election managed by Vottery</p>
          <p>Vote Count: {election.vote_count || 0} | Views: {election.view_count || 0}</p>
        </div>
      </div>
    </div>
  );
}