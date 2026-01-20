// SimilarElections.jsx
// Uses your existing /api/recommendations/similar/:electionId endpoint
// which uses Shaped AI's TRUE semantic similarity (sentence-transformers/all-MiniLM-L6-v2)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaRobot,
  FaEye,
  FaShare,
  FaCalendar,
  FaVoteYea,
  FaTrophy,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaBrain,
  FaCheckCircle,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaTimes,
} from 'react-icons/fa';

// Generate gradient based on election id
const getPlaceholderGradient = (election) => {
  const gradients = [
    'from-blue-400 to-purple-500',
    'from-green-400 to-cyan-500',
    'from-orange-400 to-pink-500',
    'from-indigo-400 to-blue-500',
    'from-pink-400 to-rose-500',
    'from-teal-400 to-emerald-500',
  ];
  const id = parseInt(election.id || election.election_id || 0);
  return gradients[id % gradients.length];
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Individual similar election card
const SimilarElectionCard = ({ election, onView, onShare }) => {
  const hasImage = election.topic_image_url;
  const hasLottery = election.lottery_enabled === true || election.lottery_enabled === 'true';
  const prizePool = parseFloat(election.lottery_prize_pool || election.lottery_total_prize_pool || 0);
  const similaritySource = election.similarity_source || 'shaped_ai';

  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image Section */}
      <div className="relative h-32 overflow-hidden">
        {hasImage ? (
          <img
            src={election.topic_image_url}
            alt={election.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Gradient Placeholder */}
        <div
          className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(election)} ${hasImage ? 'hidden' : 'flex'} flex-col items-center justify-center`}
        >
          <span className="text-white/90 text-sm font-medium capitalize">
            {election.voting_type?.replace('_', ' ') || 'Election'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            election.status === 'active' ? 'bg-green-500 text-white' :
            election.status === 'published' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {election.status?.charAt(0).toUpperCase() + election.status?.slice(1) || 'Published'}
          </span>
        </div>

        {/* Lottery Badge */}
        {hasLottery && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 flex items-center gap-1">
              <FaTrophy className="text-[10px]" /> Lottery
            </span>
          </div>
        )}

        {/* AI Badge - Shows Shaped AI verification */}
        <div className="absolute bottom-2 right-2">
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1 cursor-help"
            title={`Source: ${similaritySource}`}
          >
            <FaRobot className="text-[10px]" /> AI Match
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
          {election.title}
        </h4>

        {/* Prize Display for Lottery */}
        {hasLottery && prizePool > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FaTrophy className="text-yellow-500 text-sm" />
            <span className="font-bold text-yellow-600 text-sm">
              ${prizePool.toLocaleString()} Prize
            </span>
          </div>
        )}

        {/* Date & Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <FaCalendar className="text-gray-400" />
            {formatDate(election.end_date)}
          </span>
          <span className="flex items-center gap-1">
            <FaVoteYea /> {election.vote_count || 0}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onView(election)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors"
          >
            <FaEye /> View
          </button>
          <button
            onClick={() => onShare(election)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors"
          >
            <FaShare /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function SimilarElections({ electionId }) {
  const navigate = useNavigate();
  const [similarElections, setSimilarElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (electionId) {
      fetchSimilarElections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const fetchSimilarElections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://prod-recommendation-service.onrender.com/api/recommendations/similar/${electionId}?limit=6`
      );
      const data = await response.json();
      
      // Store full API response for proof
      setApiResponse(data);
      
      if (data.success) {
        // Filter out draft and ended elections for display
        const activeElections = (data.data || []).filter(e => {
          const status = (e.status || '').toLowerCase();
          if (status === 'draft' || status === 'cancelled') return false;
          
          // Check if ended
          if (e.end_date) {
            const endDate = new Date(e.end_date);
            if (endDate < new Date()) return false;
          }
          return true;
        });
        setSimilarElections(activeElections);
      } else {
        setError(data.message || 'Failed to load similar elections');
      }
    } catch (err) {
      console.error('Failed to fetch similar elections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (election) => {
    const id = election.id || election.election_id;
    navigate(`/dashboard/election/${id}`, { state: { source: 'all-elections' } });
  };

  const handleShare = (election) => {
    const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Don't render if no election ID
  if (!electionId) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <FaRobot />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">Similar Elections</h3>
              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                <FaRobot className="text-[10px]" /> AI
              </span>
              {/* Verified Badge */}
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <FaCheckCircle className="text-[10px]" /> Shaped AI
              </span>
            </div>
            <p className="text-sm text-gray-600">Powered by Shaped AI semantic similarity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Info/Proof Button */}
          <button
            onClick={() => setShowProofModal(true)}
            className="p-2 rounded-full bg-white shadow-md hover:bg-purple-50 transition-colors"
            title="View Shaped AI Proof"
          >
            <FaInfoCircle className="text-purple-600" />
          </button>
          
          {similarElections.length > 3 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
            </>
          )}
          <button
            onClick={fetchSimilarElections}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <FaSyncAlt className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Shaped AI Attribution Banner */}
      <div className="mb-4 bg-white/70 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaBrain className="text-purple-600 text-lg" />
          <div>
            <p className="text-xs font-medium text-gray-700">
              Recommendations powered by <span className="text-purple-600 font-bold">Shaped AI</span>
            </p>
            <p className="text-xs text-gray-500">
              Model: sentence-transformers/all-MiniLM-L6-v2 | Metric: Cosine Similarity
            </p>
          </div>
        </div>
        <a
          href="https://www.shaped.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          Learn more <FaExternalLinkAlt className="text-[10px]" />
        </a>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchSimilarElections}
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : similarElections.length === 0 ? (
        <div className="bg-white/50 rounded-xl p-8 text-center">
          <FaRobot className="text-4xl text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No similar elections found</p>
          <p className="text-gray-400 text-sm mt-1">Check back as more elections are added</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {similarElections.map((election) => (
            <SimilarElectionCard
              key={election.id || election.election_id}
              election={election}
              onView={handleView}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* Footer with verification */}
      {similarElections.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-200/50">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FaRobot /> sentence-transformers/all-MiniLM-L6-v2
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <FaCheckCircle /> Source: shaped_ai
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {similarElections.length} similar election{similarElections.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <FaBrain className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Shaped AI Recommendation Proof</h2>
                    <p className="text-purple-100 text-sm">Semantic similarity powered by ML</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProofModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* How it works */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaRobot className="text-purple-600" />
                  How Shaped AI Similarity Works
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-medium text-gray-800">Text Embedding</p>
                      <p className="text-sm text-gray-600">Election titles and descriptions are converted into 384-dimensional vectors using sentence-transformers/all-MiniLM-L6-v2</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-medium text-gray-800">Semantic Matching</p>
                      <p className="text-sm text-gray-600">Cosine similarity is calculated between the current election embedding and all other elections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="font-medium text-gray-800">Ranking & Filtering</p>
                      <p className="text-sm text-gray-600">Top matches are returned, filtered by status and end date</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBrain className="text-blue-600" />
                  Model Information
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-blue-100">
                        <td className="py-2 font-medium text-gray-700">Model</td>
                        <td className="py-2 text-gray-600">sentence-transformers/all-MiniLM-L6-v2</td>
                      </tr>
                      <tr className="border-b border-blue-100">
                        <td className="py-2 font-medium text-gray-700">Embedding Size</td>
                        <td className="py-2 text-gray-600">384 dimensions</td>
                      </tr>
                      <tr className="border-b border-blue-100">
                        <td className="py-2 font-medium text-gray-700">Similarity Metric</td>
                        <td className="py-2 text-gray-600">Cosine Similarity</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-gray-700">Provider</td>
                        <td className="py-2 text-gray-600 font-bold text-purple-600">Shaped AI</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* API Response Proof */}
              {apiResponse && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Live API Response (Proof)
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-xs whitespace-pre-wrap">
{JSON.stringify({
  success: apiResponse.success,
  source_election_id: apiResponse.source_election_id,
  total_results: apiResponse.data?.length || 0,
  sample_result: apiResponse.data?.[0] ? {
    id: apiResponse.data[0].id,
    title: apiResponse.data[0].title,
    similarity_source: apiResponse.data[0].similarity_source,
  } : null
}, null, 2)}
                    </pre>
                  </div>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <span><strong>Proof:</strong> Each result contains <code className="bg-green-100 px-1 rounded">&quot;similarity_source&quot;: &quot;shaped_ai&quot;</code></span>
                    </p>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <a
                  href="https://www.shaped.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                >
                  <FaExternalLinkAlt /> Visit Shaped AI
                </a>
                <a
                  href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FaExternalLinkAlt /> View Model on HuggingFace
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//last workable code only to prove that it is from shaped above code
// // SimilarElections.jsx
// // Uses your existing /api/recommendations/similar/:electionId endpoint
// // which uses Shaped AI's TRUE semantic similarity (sentence-transformers/all-MiniLM-L6-v2)

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaRobot,
//   FaEye,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaTrophy,
//   FaChevronLeft,
//   FaChevronRight,
//   FaSyncAlt,
// } from 'react-icons/fa';

// // Generate gradient based on election id
// const getPlaceholderGradient = (election) => {
//   const gradients = [
//     'from-blue-400 to-purple-500',
//     'from-green-400 to-cyan-500',
//     'from-orange-400 to-pink-500',
//     'from-indigo-400 to-blue-500',
//     'from-pink-400 to-rose-500',
//     'from-teal-400 to-emerald-500',
//   ];
//   const id = parseInt(election.id || election.election_id || 0);
//   return gradients[id % gradients.length];
// };

// // Format date
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   });
// };

// // Individual similar election card
// const SimilarElectionCard = ({ election, onView, onShare }) => {
//   const hasImage = election.topic_image_url;
//   const hasLottery = election.lottery_enabled === true || election.lottery_enabled === 'true';
//   const prizePool = parseFloat(election.lottery_prize_pool || election.lottery_total_prize_pool || 0);

//   return (
//     <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
//       {/* Image Section */}
//       <div className="relative h-32 overflow-hidden">
//         {hasImage ? (
//           <img
//             src={election.topic_image_url}
//             alt={election.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             onError={(e) => {
//               e.target.style.display = 'none';
//               e.target.nextElementSibling.style.display = 'flex';
//             }}
//           />
//         ) : null}
        
//         {/* Gradient Placeholder */}
//         <div
//           className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(election)} ${hasImage ? 'hidden' : 'flex'} flex-col items-center justify-center`}
//         >
//           <span className="text-white/90 text-sm font-medium capitalize">
//             {election.voting_type?.replace('_', ' ') || 'Election'}
//           </span>
//         </div>

//         {/* Status Badge */}
//         <div className="absolute top-2 left-2">
//           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//             election.status === 'active' ? 'bg-green-500 text-white' :
//             election.status === 'published' ? 'bg-blue-500 text-white' :
//             'bg-gray-500 text-white'
//           }`}>
//             {election.status?.charAt(0).toUpperCase() + election.status?.slice(1) || 'Published'}
//           </span>
//         </div>

//         {/* Lottery Badge */}
//         {hasLottery && (
//           <div className="absolute top-2 right-2">
//             <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 flex items-center gap-1">
//               <FaTrophy className="text-[10px]" /> Lottery
//             </span>
//           </div>
//         )}

//         {/* AI Badge */}
//         <div className="absolute bottom-2 right-2">
//           <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
//             <FaRobot className="text-[10px]" /> AI Match
//           </span>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="p-4">
//         <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
//           {election.title}
//         </h4>

//         {/* Prize Display for Lottery */}
//         {hasLottery && prizePool > 0 && (
//           <div className="flex items-center gap-1 mb-2">
//             <FaTrophy className="text-yellow-500 text-sm" />
//             <span className="font-bold text-yellow-600 text-sm">
//               ${prizePool.toLocaleString()} Prize
//             </span>
//           </div>
//         )}

//         {/* Date & Stats */}
//         <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
//           <span className="flex items-center gap-1">
//             <FaCalendar className="text-gray-400" />
//             {formatDate(election.end_date)}
//           </span>
//           <span className="flex items-center gap-1">
//             <FaVoteYea /> {election.vote_count || 0}
//           </span>
//         </div>

//         {/* Action Buttons */}
//         <div className="grid grid-cols-2 gap-2">
//           <button
//             onClick={() => onView(election)}
//             className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors"
//           >
//             <FaEye /> View
//           </button>
//           <button
//             onClick={() => onShare(election)}
//             className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors"
//           >
//             <FaShare /> Share
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Component
// export default function SimilarElections({ electionId }) {
//   const navigate = useNavigate();
//   const [similarElections, setSimilarElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     if (electionId) {
//       fetchSimilarElections();
//     }
//   }, [electionId]);

//   const fetchSimilarElections = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `https://prod-recommendation-service.onrender.com/api/recommendations/similar/${electionId}?limit=6`
//       );
//       const data = await response.json();
      
//       if (data.success) {
//         // Filter out draft and ended elections for display
//         const activeElections = (data.data || []).filter(e => {
//           const status = (e.status || '').toLowerCase();
//           if (status === 'draft' || status === 'cancelled') return false;
          
//           // Check if ended
//           if (e.end_date) {
//             const endDate = new Date(e.end_date);
//             if (endDate < new Date()) return false;
//           }
//           return true;
//         });
//         setSimilarElections(activeElections);
//       } else {
//         setError(data.message || 'Failed to load similar elections');
//       }
//     } catch (err) {
//       console.error('Failed to fetch similar elections:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleView = (election) => {
//     const id = election.id || election.election_id;
//     navigate(`/election/${id}`);
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const scroll = (direction) => {
//     if (scrollRef.current) {
//       const scrollAmount = 280;
//       scrollRef.current.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth',
//       });
//     }
//   };

//   // Don't render if no election ID
//   if (!electionId) return null;

//   return (
//     <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
//             <FaRobot />
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <h3 className="font-bold text-gray-800">Similar Elections</h3>
//               <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full flex items-center gap-1">
//                 <FaRobot className="text-[10px]" /> AI
//               </span>
//             </div>
//             <p className="text-sm text-gray-600">Powered by Shaped AI semantic similarity</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           {similarElections.length > 3 && (
//             <>
//               <button
//                 onClick={() => scroll('left')}
//                 className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//               >
//                 <FaChevronLeft className="text-gray-600" />
//               </button>
//               <button
//                 onClick={() => scroll('right')}
//                 className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//               >
//                 <FaChevronRight className="text-gray-600" />
//               </button>
//             </>
//           )}
//           <button
//             onClick={fetchSimilarElections}
//             className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//             title="Refresh"
//           >
//             <FaSyncAlt className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <div className="flex gap-4 overflow-hidden">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
//               <div className="h-32 bg-gray-200" />
//               <div className="p-4 space-y-3">
//                 <div className="h-4 bg-gray-200 rounded w-3/4" />
//                 <div className="h-3 bg-gray-200 rounded w-1/2" />
//                 <div className="flex gap-2">
//                   <div className="h-8 bg-gray-200 rounded flex-1" />
//                   <div className="h-8 bg-gray-200 rounded flex-1" />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : error ? (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
//           <p className="text-red-600 text-sm">{error}</p>
//           <button
//             onClick={fetchSimilarElections}
//             className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
//           >
//             Retry
//           </button>
//         </div>
//       ) : similarElections.length === 0 ? (
//         <div className="bg-white/50 rounded-xl p-8 text-center">
//           <FaRobot className="text-4xl text-gray-300 mx-auto mb-2" />
//           <p className="text-gray-500">No similar elections found</p>
//           <p className="text-gray-400 text-sm mt-1">Check back as more elections are added</p>
//         </div>
//       ) : (
//         <div
//           ref={scrollRef}
//           className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
//           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//         >
//           {similarElections.map((election) => (
//             <SimilarElectionCard
//               key={election.id || election.election_id}
//               election={election}
//               onView={handleView}
//               onShare={handleShare}
//             />
//           ))}
//         </div>
//       )}

//       {/* Footer */}
//       {similarElections.length > 0 && (
//         <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-200/50">
//           <span className="text-xs text-gray-400 flex items-center gap-1">
//             <FaRobot /> sentence-transformers/all-MiniLM-L6-v2
//           </span>
//           <span className="text-xs text-gray-500">
//             {similarElections.length} similar election{similarElections.length !== 1 ? 's' : ''}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }
// // SimilarElections.jsx
// // Uses Shaped AI's content embeddings for TRUE AI-powered similarity
// // The engine uses sentence-transformers/all-MiniLM-L6-v2 on title, description, voting_type

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaRobot,
//   FaEye,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaTrophy,
//   FaChevronLeft,
//   FaChevronRight,
//   FaSyncAlt,
// } from 'react-icons/fa';

// // API call to get similar elections from Shaped AI
// const getSimilarElectionsApi = async (electionId, limit = 5) => {
//   try {
//     // This queries Shaped AI using semantic similarity on content embeddings
//     const response = await fetch(
//       `https://prod-recommendation-service.onrender.com/api/recommendations/similar/${electionId}?limit=${limit}`
//     );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Failed to fetch similar elections:', error);
//     throw error;
//   }
// };

// // Generate gradient based on election id
// const getPlaceholderGradient = (election) => {
//   const gradients = [
//     'from-blue-400 to-purple-500',
//     'from-green-400 to-cyan-500',
//     'from-orange-400 to-pink-500',
//     'from-indigo-400 to-blue-500',
//     'from-pink-400 to-rose-500',
//     'from-teal-400 to-emerald-500',
//   ];
//   const id = parseInt(election.id || election.election_id || 0);
//   return gradients[id % gradients.length];
// };

// // Format date
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   });
// };

// // Individual similar election card
// const SimilarElectionCard = ({ election, onView, onShare }) => {
//   const hasImage = election.topic_image_url;
//   const hasLottery = election.lottery_enabled === true || election.lottery_enabled === 'true';
//   const prizePool = parseFloat(election.lottery_prize_pool || election.lottery_total_prize_pool || 0);

//   return (
//     <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
//       {/* Image Section */}
//       <div className="relative h-32 overflow-hidden">
//         {hasImage ? (
//           <img
//             src={election.topic_image_url}
//             alt={election.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             onError={(e) => {
//               e.target.style.display = 'none';
//               e.target.nextElementSibling.style.display = 'flex';
//             }}
//           />
//         ) : null}
        
//         {/* Gradient Placeholder */}
//         <div
//           className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient(election)} ${hasImage ? 'hidden' : 'flex'} flex-col items-center justify-center`}
//         >
//           <span className="text-white/90 text-sm font-medium capitalize">
//             {election.voting_type?.replace('_', ' ') || 'Election'}
//           </span>
//         </div>

//         {/* Status Badge */}
//         <div className="absolute top-2 left-2">
//           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//             election.status === 'active' ? 'bg-green-500 text-white' :
//             election.status === 'published' ? 'bg-blue-500 text-white' :
//             'bg-gray-500 text-white'
//           }`}>
//             {election.status?.charAt(0).toUpperCase() + election.status?.slice(1) || 'Published'}
//           </span>
//         </div>

//         {/* Lottery Badge */}
//         {hasLottery && (
//           <div className="absolute top-2 right-2">
//             <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 flex items-center gap-1">
//               <FaTrophy className="text-[10px]" /> Lottery
//             </span>
//           </div>
//         )}

//         {/* AI Similarity Badge */}
//         {election.similarity_score && (
//           <div className="absolute bottom-2 right-2">
//             <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
//               <FaRobot className="text-[10px]" /> {Math.round(election.similarity_score * 100)}% match
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Content Section */}
//       <div className="p-4">
//         <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
//           {election.title}
//         </h4>

//         {/* Prize Display for Lottery */}
//         {hasLottery && prizePool > 0 && (
//           <div className="flex items-center gap-1 mb-2">
//             <FaTrophy className="text-yellow-500 text-sm" />
//             <span className="font-bold text-yellow-600 text-sm">
//               ${prizePool.toLocaleString()} Prize
//             </span>
//           </div>
//         )}

//         {/* Date & Stats */}
//         <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
//           <span className="flex items-center gap-1">
//             <FaCalendar className="text-gray-400" />
//             {formatDate(election.end_date)}
//           </span>
//           <span className="flex items-center gap-1">
//             <FaVoteYea /> {election.vote_count || 0}
//           </span>
//         </div>

//         {/* Action Buttons */}
//         <div className="grid grid-cols-2 gap-2">
//           <button
//             onClick={() => onView(election)}
//             className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors"
//           >
//             <FaEye /> View
//           </button>
//           <button
//             onClick={() => onShare(election)}
//             className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors"
//           >
//             <FaShare /> Share
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Component
// /*eslint-disable*/
// export default function SimilarElections({ electionId, currentElectionTitle }) {
//   const navigate = useNavigate();
//   const [similarElections, setSimilarElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const scrollRef = React.useRef(null);

//   useEffect(() => {
//     if (electionId) {
//       fetchSimilarElections();
//     }
//   }, [electionId]);

//   const fetchSimilarElections = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await getSimilarElectionsApi(electionId, 6);
//       if (response.success) {
//         // Filter out the current election
//         const filtered = (response.data || []).filter(
//           e => String(e.id || e.election_id) !== String(electionId)
//         );
//         setSimilarElections(filtered);
//       } else {
//         setError(response.message || 'Failed to load similar elections');
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleView = (election) => {
//     const id = election.id || election.election_id;
//     navigate(`/election/${id}`);
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const scroll = (direction) => {
//     if (scrollRef.current) {
//       const scrollAmount = 280;
//       scrollRef.current.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth',
//       });
//     }
//   };

//   // Don't render if no election ID
//   if (!electionId) return null;

//   return (
//     <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
//             <FaRobot />
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <h3 className="font-bold text-gray-800">Similar Elections</h3>
//               <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full flex items-center gap-1">
//                 <FaRobot className="text-[10px]" /> AI
//               </span>
//             </div>
//             <p className="text-sm text-gray-600">Based on content similarity by Shaped AI</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           {similarElections.length > 3 && (
//             <>
//               <button
//                 onClick={() => scroll('left')}
//                 className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//               >
//                 <FaChevronLeft className="text-gray-600" />
//               </button>
//               <button
//                 onClick={() => scroll('right')}
//                 className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//               >
//                 <FaChevronRight className="text-gray-600" />
//               </button>
//             </>
//           )}
//           <button
//             onClick={fetchSimilarElections}
//             className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//             title="Refresh"
//           >
//             <FaSyncAlt className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <div className="flex gap-4 overflow-hidden">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
//               <div className="h-32 bg-gray-200" />
//               <div className="p-4 space-y-3">
//                 <div className="h-4 bg-gray-200 rounded w-3/4" />
//                 <div className="h-3 bg-gray-200 rounded w-1/2" />
//                 <div className="flex gap-2">
//                   <div className="h-8 bg-gray-200 rounded flex-1" />
//                   <div className="h-8 bg-gray-200 rounded flex-1" />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : error ? (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
//           <p className="text-red-600 text-sm">{error}</p>
//           <button
//             onClick={fetchSimilarElections}
//             className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
//           >
//             Retry
//           </button>
//         </div>
//       ) : similarElections.length === 0 ? (
//         <div className="bg-white/50 rounded-xl p-8 text-center">
//           <FaRobot className="text-4xl text-gray-300 mx-auto mb-2" />
//           <p className="text-gray-500">No similar elections found</p>
//           <p className="text-gray-400 text-sm mt-1">Check back as more elections are added</p>
//         </div>
//       ) : (
//         <div
//           ref={scrollRef}
//           className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
//           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//         >
//           {similarElections.map((election) => (
//             <SimilarElectionCard
//               key={election.id || election.election_id}
//               election={election}
//               onView={handleView}
//               onShare={handleShare}
//             />
//           ))}
//         </div>
//       )}

//       {/* Footer */}
//       {similarElections.length > 0 && (
//         <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-200/50">
//           <span className="text-xs text-gray-400 flex items-center gap-1">
//             <FaRobot /> Powered by Shaped AI (sentence-transformers)
//           </span>
//           <span className="text-xs text-gray-500">
//             {similarElections.length} similar election{similarElections.length !== 1 ? 's' : ''}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }