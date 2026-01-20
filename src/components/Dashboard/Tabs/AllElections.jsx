//All Elections - Shows ALL elections for any authenticated user
//With AI Recommendation Sections: Trending, Popular, Top Lottery
//Only View and Share buttons - Edit, Delete, Clone handled in My Elections

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaShare,
  FaCalendar,
  FaVoteYea,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaFire,
  FaStar,
  FaTrophy,
  FaRobot,
  FaSyncAlt,
} from 'react-icons/fa';
import { getAllElections } from '../../../redux/api/election/electionApi';
import AIRecommendationSection from '../../../components/ai/AIRecommendationSection';
import {
  getTrendingElectionsApi,
  getPopularElectionsApi,
  getLotteryElectionsApi,
} from '../../../redux/api/recommendations/recommendationApi';

export default function AllElections() {
  const navigate = useNavigate();
  
  // Regular elections state
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElections, setTotalElections] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiError, setApiError] = useState(null);
  
  // AI Recommendations state
  const [trendingElections, setTrendingElections] = useState([]);
  const [popularElections, setPopularElections] = useState([]);
  const [lotteryElections, setLotteryElections] = useState([]);
  const [aiLoading, setAiLoading] = useState({
    trending: true,
    popular: true,
    lottery: true,
  });
  const [aiErrors, setAiErrors] = useState({
    trending: null,
    popular: null,
    lottery: null,
  });
  const [showAiSections, setShowAiSections] = useState(true);
  
  const ITEMS_PER_PAGE = 9;

  // Fetch AI Recommendations
  const fetchAIRecommendations = useCallback(async () => {
    // Fetch Trending
    setAiLoading(prev => ({ ...prev, trending: true }));
    try {
      const trendingResponse = await getTrendingElectionsApi(6);
      if (trendingResponse.success) {
        setTrendingElections(trendingResponse.data || []);
      }
      setAiErrors(prev => ({ ...prev, trending: null }));
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      setAiErrors(prev => ({ ...prev, trending: error.message }));
    } finally {
      setAiLoading(prev => ({ ...prev, trending: false }));
    }

    // Fetch Popular
    setAiLoading(prev => ({ ...prev, popular: true }));
    try {
      const popularResponse = await getPopularElectionsApi(6);
      if (popularResponse.success) {
        setPopularElections(popularResponse.data || []);
      }
      setAiErrors(prev => ({ ...prev, popular: null }));
    } catch (error) {
      console.error('Failed to fetch popular:', error);
      setAiErrors(prev => ({ ...prev, popular: error.message }));
    } finally {
      setAiLoading(prev => ({ ...prev, popular: false }));
    }

    // Fetch Lottery
    setAiLoading(prev => ({ ...prev, lottery: true }));
    try {
      const lotteryResponse = await getLotteryElectionsApi(6);
      if (lotteryResponse.success) {
        setLotteryElections(lotteryResponse.data || []);
      }
      setAiErrors(prev => ({ ...prev, lottery: null }));
    } catch (error) {
      console.error('Failed to fetch lottery:', error);
      setAiErrors(prev => ({ ...prev, lottery: error.message }));
    } finally {
      setAiLoading(prev => ({ ...prev, lottery: false }));
    }
  }, []);

  // Fetch regular elections
  const fetchElections = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const response = await getAllElections(
        currentPage, 
        ITEMS_PER_PAGE, 
        statusFilter !== 'all' ? statusFilter : 'all'
      );
      
      if (response && response.data) {
        const electionsData = response.data.elections || [];
        const total = response.data.total || 0;
        const limit = response.data.limit || ITEMS_PER_PAGE;
        
        setElections(electionsData);
        setTotalElections(total);
        setTotalPages(Math.ceil(total / limit));
      } else if (response && response.elections) {
        const electionsData = response.elections || [];
        const paginationData = response.pagination || {};
        
        setElections(electionsData);
        setTotalPages(paginationData.totalPages || 1);
        setTotalElections(paginationData.total || 0);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load elections';
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  useEffect(() => {
    fetchAIRecommendations();
  }, [fetchAIRecommendations]);

  const filteredElections = elections.filter(election =>
    election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    election.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (election) => {
    const shareUrl = `${window.location.origin}/vote/${election.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleView = (election) => {
    const electionId = election.id || election.election_id;
    navigate(`/election/${electionId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-purple-100 text-purple-700',
    };
    return configs[status?.toLowerCase()] || configs.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      published: 'Published',
      active: 'Active',
      completed: 'Completed',
    };
    return labels[status?.toLowerCase()] || status;
  };

  const refreshAIRecommendations = () => {
    toast.info('Refreshing AI recommendations...');
    fetchAIRecommendations();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
          <p className="text-gray-600 mt-1">{totalElections} total elections</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAIRecommendations}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            title="Refresh AI Recommendations"
          >
            <FaSyncAlt className={aiLoading.trending ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Refresh AI</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/create-election')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaPlus />
            <span>Create Election</span>
          </button>
        </div>
      </div>

      {/* AI Toggle */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <FaRobot />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">AI-Powered Recommendations</h4>
            <p className="text-sm text-gray-600">Discover elections curated by Shaped AI</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showAiSections}
            onChange={(e) => setShowAiSections(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* AI Recommendation Sections */}
      {showAiSections && (
        <div className="space-y-4">
          {/* Trending Elections */}
          <AIRecommendationSection
            title="🔥 Trending Now"
            subtitle="Hot elections this week"
            elections={trendingElections}
            loading={aiLoading.trending}
            error={aiErrors.trending}
            icon={<FaFire />}
            accentColor="orange"
            onViewElection={handleView}
            onShareElection={handleShare}
            emptyMessage="No trending elections right now"
          />

          {/* Popular Elections */}
          <AIRecommendationSection
            title="⭐ Most Popular"
            subtitle="All-time favorites"
            elections={popularElections}
            loading={aiLoading.popular}
            error={aiErrors.popular}
            icon={<FaStar />}
            accentColor="blue"
            onViewElection={handleView}
            onShareElection={handleShare}
            emptyMessage="No popular elections yet"
          />

          {/* Top Lottery Prizes */}
          <AIRecommendationSection
            title="🎰 Top Lottery Prizes"
            subtitle="Biggest prize pools"
            elections={lotteryElections}
            loading={aiLoading.lottery}
            error={aiErrors.lottery}
            icon={<FaTrophy />}
            accentColor="gold"
            onViewElection={handleView}
            onShareElection={handleShare}
            emptyMessage="No lottery elections available"
          />
        </div>
      )}

      {/* Divider */}
      {showAiSections && (
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500 font-medium">All Elections</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
      )}

      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700">{apiError}</p>
          <button
            onClick={fetchElections}
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading elections...</p>
        </div>
      ) : filteredElections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🗳️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create your first election to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => navigate('/dashboard/create-election')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
            >
              <FaPlus />
              Create Your First Election
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => {
              return (
                <div
                  key={election.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                    {election.topic_image_url ? (
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
                    <div 
                      className={`w-full h-full ${election.topic_image_url ? 'hidden' : 'flex'} flex-col items-center justify-center`}
                    >
                      <FaImage className="text-6xl text-gray-300" />
                      <p className="text-xs text-gray-400 mt-2">No image</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(election.status)}`}>
                        {getStatusLabel(election.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                      {election.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {election.description || 'No description'}
                    </p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendar className="text-gray-400 flex-shrink-0" />
                        <span className="truncate text-xs">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {election.voting_type || 'Plurality'}
                        </span>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaVoteYea /> {election.vote_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye /> {election.view_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Only View & Share for All Elections */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleView(election)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => handleShare(election)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
                      >
                        <FaShare /> Share
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
//last workable code.only to add AI part above code
// //All Elections - Shows ALL elections for any authenticated user
// //Only View and Share buttons - Edit, Delete, Clone handled in My Elections
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { getAllElections } from '../../../redux/api/election/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       const response = await getAllElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : 'all'
//       );
      
//       if (response && response.data) {
//         const electionsData = response.data.elections || [];
//         const total = response.data.total || 0;
//         const limit = response.data.limit || ITEMS_PER_PAGE;
        
//         setElections(electionsData);
//         setTotalElections(total);
//         setTotalPages(Math.ceil(total / limit));
//       } else if (response && response.elections) {
//         const electionsData = response.elections || [];
//         const paginationData = response.pagination || {};
        
//         setElections(electionsData);
//         setTotalPages(paginationData.totalPages || 1);
//         setTotalElections(paginationData.total || 0);
//       } else {
//         throw new Error('Unexpected response format');
//       }
//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to load elections';
//       setApiError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, statusFilter]);

//   useEffect(() => {
//     fetchElections();
//   }, [fetchElections]);

//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleShare = (election) => {
//     // Use election SLUG (not ID) for the public voting page
//     const shareUrl = `${window.location.origin}/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/election/${election.id}`);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   const getStatusBadge = (status) => {
//     const configs = {
//       draft: 'bg-gray-100 text-gray-700',
//       published: 'bg-blue-100 text-blue-700',
//       active: 'bg-green-100 text-green-700',
//       completed: 'bg-purple-100 text-purple-700',
//     };
//     return configs[status?.toLowerCase()] || configs.draft;
//   };

//   const getStatusLabel = (status) => {
//     const labels = {
//       draft: 'Draft',
//       published: 'Published',
//       active: 'Active',
//       completed: 'Completed',
//     };
//     return labels[status?.toLowerCase()] || status;
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard/create-election')}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {apiError && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <p className="text-sm text-red-700">{apiError}</p>
//           <button
//             onClick={fetchElections}
//             className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md p-4">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search elections..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <FaFilter className="text-gray-400" />
//             <select
//               value={statusFilter}
//               onChange={(e) => {
//                 setStatusFilter(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="all">All Status</option>
//               <option value="draft">Draft</option>
//               <option value="published">Published</option>
//               <option value="active">Active</option>
//               <option value="completed">Completed</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-12 text-center">
//           <div className="text-6xl mb-4">🗳️</div>
//           <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Found</h3>
//           <p className="text-gray-600 mb-4">
//             {searchQuery || statusFilter !== 'all' 
//               ? 'Try adjusting your filters' 
//               : 'Create your first election to get started'}
//           </p>
//           {!searchQuery && statusFilter === 'all' && (
//             <button
//               onClick={() => navigate('/dashboard/create-election')}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => {
//               return (
//                 <div
//                   key={election.id}
//                   className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//                 >
//                   <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                     {election.topic_image_url ? (
//                       <img
//                         src={election.topic_image_url}
//                         alt={election.title}
//                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                           e.target.nextElementSibling.style.display = 'flex';
//                         }}
//                       />
//                     ) : null}
//                     <div 
//                       className={`w-full h-full ${election.topic_image_url ? 'hidden' : 'flex'} flex-col items-center justify-center`}
//                     >
//                       <FaImage className="text-6xl text-gray-300" />
//                       <p className="text-xs text-gray-400 mt-2">No image</p>
//                     </div>
//                     <div className="absolute top-3 right-3">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(election.status)}`}>
//                         {getStatusLabel(election.status)}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="p-5">
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
//                       {election.title}
//                     </h3>

//                     <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
//                       {election.description || 'No description'}
//                     </p>

//                     <div className="space-y-2 mb-4 text-sm">
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <FaCalendar className="text-gray-400 flex-shrink-0" />
//                         <span className="truncate text-xs">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                           {election.voting_type || 'Plurality'}
//                         </span>
//                         <div className="flex gap-3 text-xs text-gray-500">
//                           <span className="flex items-center gap-1">
//                             <FaVoteYea /> {election.vote_count || 0}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <FaEye /> {election.view_count || 0}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Action Buttons - Only View & Share for All Elections */}
//                     <div className="grid grid-cols-2 gap-2">
//                       <button
//                         onClick={() => handleView(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEye /> View
//                       </button>
//                       <button
//                         onClick={() => handleShare(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                       >
//                         <FaShare /> Share
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {totalPages > 1 && (
//             <div className="flex items-center justify-center gap-2 mt-6">
//               <button
//                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <FaChevronLeft />
//               </button>
              
//               <div className="flex gap-2">
//                 {[...Array(Math.min(totalPages, 5))].map((_, i) => {
//                   const pageNum = i + 1;
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                         currentPage === pageNum
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-white border border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               </div>

//               <button
//                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <FaChevronRight />
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

