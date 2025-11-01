//All Elections - Shows ALL elections for any authenticated user
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaCopy,
  FaShare,
  FaCalendar,
  FaVoteYea,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
} from 'react-icons/fa';
import { cloneElection, deleteElection, getAllElections } from '../../../redux/api/election/electionApi';

export default function AllElections() {
  const navigate = useNavigate();
  
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElections, setTotalElections] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
  const [apiError, setApiError] = useState(null);
  
  const ITEMS_PER_PAGE = 9;

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

  const filteredElections = elections.filter(election =>
    election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    election.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (election) => {
    setDeleteModal({ show: true, electionId: election.id, title: election.title });
  };

  const confirmDelete = async () => {
    try {
      await deleteElection(deleteModal.electionId);
      toast.success('Election deleted successfully');
      setDeleteModal({ show: false, electionId: null, title: '' });
      fetchElections();
    } catch (error) {
      console.error('Error deleting election:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
      toast.error(errorMessage);
    }
  };

  const handleClone = async (election) => {
    try {
      const newTitle = `${election.title} (Copy)`;
      await cloneElection(election.id, newTitle);
      toast.success('Election cloned successfully');
      fetchElections();
    } catch (error) {
      console.error('Error cloning election:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
      toast.error(errorMessage);
    }
  };

  // const handleShare = (election) => {
  //   // ✅ Use election ID (not slug)
  //   const shareUrl = `${window.location.origin}/vote/${election.id}`;
  //   navigator.clipboard.writeText(shareUrl);
  //   toast.success('Link copied to clipboard!');
  // };
  const handleShare = (election) => {
  // ✅ Use election SLUG (not ID) for the public voting page
  const shareUrl = `${window.location.origin}/vote/${election.slug}`;
  navigator.clipboard.writeText(shareUrl);
  toast.success('Link copied to clipboard!');
};

  const handleView = (election) => {
    navigate(`/election/${election.id}`);
  };

  const handleEdit = (election) => {
    navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
          <p className="text-gray-600 mt-1">{totalElections} total elections</p>
        </div>
        <button
          onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <FaPlus />
          <span>Create Election</span>
        </button>
      </div>

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your elections...</p>
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
              onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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
            {filteredElections.map((election) => (
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
                        e.target.nextElementSibling.style.display = 'flex';
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

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleView(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleEdit(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleShare(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
                    >
                      <FaShare /> Share
                    </button>
                    <button
                      onClick={() => handleClone(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
                    >
                      <FaCopy /> Clone
                    </button>
                    <button
                      onClick={() => handleDeleteClick(election)}
                      className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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

      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
              <p className="text-gray-600">
                Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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
// //last workable code
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
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

//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };
// //this code succssul share election
//   // const handleShare = (election) => {
//   //   const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//   //   navigator.clipboard.writeText(shareUrl);
//   //   toast.success('Link copied to clipboard!');
//   // };

//   // In AllElections.jsx - Replace handleShare function

// const handleShare = (election) => {
//   // ✅ Use election ID (not slug)
//   const shareUrl = `${window.location.origin}/vote/${election.id}`;
//   navigator.clipboard.writeText(shareUrl);
//   toast.success('Link copied to clipboard!');
// };

//   const handleView = (election) => {
//     navigate(`/election/${election.id}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//           <h2 className="text-3xl font-bold text-gray-800">All Elections </h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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
//           <p className="text-gray-600">Loading your elections...</p>
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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
//             {filteredElections.map((election) => (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//               >
//                 <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                   {election.topic_image_url ? (
//                     <img
//                       src={election.topic_image_url}
//                       alt={election.title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.nextElementSibling.style.display = 'flex';
//                       }}
//                     />
//                   ) : null}
//                   <div 
//                     className={`w-full h-full ${election.topic_image_url ? 'hidden' : 'flex'} flex-col items-center justify-center`}
//                   >
//                     <FaImage className="text-6xl text-gray-300" />
//                     <p className="text-xs text-gray-400 mt-2">No image</p>
//                   </div>
//                   <div className="absolute top-3 right-3">
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(election.status)}`}>
//                       {getStatusLabel(election.status)}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-5">
//                   <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
//                     {election.title}
//                   </h3>

//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
//                     {election.description || 'No description'}
//                   </p>

//                   <div className="space-y-2 mb-4 text-sm">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <FaCalendar className="text-gray-400 flex-shrink-0" />
//                       <span className="truncate text-xs">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                         {election.voting_type || 'Plurality'}
//                       </span>
//                       <div className="flex gap-3 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <FaVoteYea /> {election.vote_count || 0}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FaEye /> {election.view_count || 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       onClick={() => handleView(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleShare(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                     >
//                       <FaShare /> Share
//                     </button>
//                     <button
//                       onClick={() => handleClone(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
//                     >
//                       <FaCopy /> Clone
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(election)}
//                       className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
//                     >
//                       <FaTrash /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
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

//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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













// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
//   const [availableImages, setAvailableImages] = useState([]);
//   const [imagesLoaded, setImagesLoaded] = useState(false);
  
//   const ITEMS_PER_PAGE = 9;

//   const fetchAvailableFiles = useCallback(async () => {
//     try {
//       const response = await fetch('http://localhost:3005/api/elections/files');
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('📁 Available files from backend:', data);
        
//         if (data.success && data.data) {
//           setAvailableImages(data.data.images || []);
//           setImagesLoaded(true);
//         }
//       } else {
//         console.error('Failed to fetch files:', response.status);
//       }
//     } catch (error) {
//       console.error('Error fetching available files:', error);
//       setImagesLoaded(true);
//     }
//   }, []);

//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
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
//     fetchAvailableFiles();
//     fetchElections();
//   }, [fetchAvailableFiles, fetchElections]);

//   const getElectionImage = (election, index) => {
//     if (election.topic_image_url) {
//       if (election.topic_image_url.startsWith('http')) {
//         return election.topic_image_url;
//       }
//       return `http://localhost:3005${election.topic_image_url.startsWith('/') ? '' : '/'}${election.topic_image_url}`;
//     }
    
//     if (availableImages.length > 0) {
//       const imageIndex = index % availableImages.length;
//       return availableImages[imageIndex].url;
//     }
    
//     return null;
//   };

//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/election/${election.id}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//           {imagesLoaded && availableImages.length > 0 && (
//             <p className="text-sm text-green-600">📁 {availableImages.length} images available</p>
//           )}
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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
//           <p className="text-gray-600">Loading your elections...</p>
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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
//             {filteredElections.map((election, index) => {
//               const imageUrl = getElectionImage(election, index);
              
//               return (
//                 <div
//                   key={election.id}
//                   className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//                 >
//                   <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                     {imageUrl ? (
//                       <>
//                         <img
//                           src={imageUrl}
//                           alt={election.title}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                           onError={(e) => {
//                             console.log('❌ Image failed to load:', imageUrl);
//                             e.target.style.display = 'none';
//                             e.target.nextElementSibling.style.display = 'flex';
//                           }}
//                         />
//                         <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
//                           <FaImage className="text-6xl text-gray-300" />
//                         </div>
//                       </>
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <FaImage className="text-6xl text-gray-300" />
//                       </div>
//                     )}
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

//                     <div className="grid grid-cols-2 gap-2">
//                       <button
//                         onClick={() => handleView(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEye /> View
//                       </button>
//                       <button
//                         onClick={() => handleEdit(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEdit /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleShare(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                       >
//                         <FaShare /> Share
//                       </button>
//                       <button
//                         onClick={() => handleClone(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
//                       >
//                         <FaCopy /> Clone
//                       </button>
//                       <button
//                         onClick={() => handleDeleteClick(election)}
//                         className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
//                       >
//                         <FaTrash /> Delete
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

//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // ⭐⭐⭐ HARDCODED IMAGES FROM YOUR UPLOADS FOLDER ⭐⭐⭐
//   const AVAILABLE_IMAGES = [
//     'http://localhost:3005/uploads/images/technology-1761764750831.png',
//     'http://localhost:3005/uploads/images/technology-1761798610953.png',
//     'http://localhost:3005/uploads/images/technology-1761991448.png',
//     'http://localhost:3005/uploads/images/technology-1761800349.png',
//     'http://localhost:3005/uploads/images/technology-1761800722.png',
//   ];
  
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
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

//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/election/${election.id}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
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

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election, index) => {
//               // ⭐⭐⭐ USE HARDCODED IMAGES IN ROTATION ⭐⭐⭐
//               const imageUrl = AVAILABLE_IMAGES[index % AVAILABLE_IMAGES.length];
              
//               return (
//                 <div
//                   key={election.id}
//                   className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//                 >
//                   {/* Image Thumbnail */}
//                   <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                     <img
//                       src={imageUrl}
//                       alt={election.title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       onError={(e) => {
//                         console.log('Image failed to load:', imageUrl);
//                         e.target.style.display = 'none';
//                         e.target.nextElementSibling.style.display = 'flex';
//                       }}
//                     />
//                     <div className="w-full h-full hidden items-center justify-center">
//                       <FaImage className="text-6xl text-gray-300" />
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

//                     <div className="grid grid-cols-2 gap-2">
//                       <button
//                         onClick={() => handleView(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEye /> View
//                       </button>
//                       <button
//                         onClick={() => handleEdit(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEdit /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleShare(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                       >
//                         <FaShare /> Share
//                       </button>
//                       <button
//                         onClick={() => handleClone(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
//                       >
//                         <FaCopy /> Clone
//                       </button>
//                       <button
//                         onClick={() => handleDeleteClick(election)}
//                         className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
//                       >
//                         <FaTrash /> Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// // Import your existing API functions
// //import { getMyElections, deleteElection, cloneElection } from '../../../api/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // State
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       console.log('📤 Fetching elections - Page:', currentPage, 'Status:', statusFilter);
      
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
//       );
      
//       console.log('📥 Full API Response:', response);
      
//       if (response && response.data) {
//         const electionsData = response.data.elections || [];
//         const total = response.data.total || 0;
//         const limit = response.data.limit || ITEMS_PER_PAGE;
        
//         console.log('✅ Elections loaded:', electionsData.length);
//         console.log('📊 Elections data:', electionsData);
        
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

//   // Filter by search
//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handlers
//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     // Navigate to election view page
//     navigate(`/election/${election.id}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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

//   // Helper to get image URL - handles both full URLs and relative paths
//   const getImageUrl = (imageUrl) => {
//     if (!imageUrl) return null;
    
//     // If it's already a full URL, return it
//     if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//       return imageUrl;
//     }
    
//     // If it's a relative path, prepend your backend URL
//     const backendUrl = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005';
//     const baseUrl = backendUrl.replace('/api', ''); // Remove /api if present
    
//     // Remove leading slash if present to avoid double slashes
//     const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
//     return `${baseUrl}${cleanPath}`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
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

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         // Empty State
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => {
//               const imageUrl = getImageUrl(election.topic_image_url);
              
//               return (
//                 <div
//                   key={election.id}
//                   className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//                 >
//                   {/* Image Thumbnail */}
//                   <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                     {imageUrl ? (
//                       <>
//                         <img
//                           src={imageUrl}
//                           alt={election.title}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                           onError={(e) => {
//                             console.log('Image failed to load:', imageUrl);
//                             e.target.style.display = 'none';
//                             e.target.nextSibling.style.display = 'flex';
//                           }}
//                         />
//                         <div className="w-full h-full hidden items-center justify-center">
//                           <FaImage className="text-6xl text-gray-300" />
//                         </div>
//                       </>
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <FaImage className="text-6xl text-gray-300" />
//                       </div>
//                     )}
//                     <div className="absolute top-3 right-3">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(election.status)}`}>
//                         {getStatusLabel(election.status)}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="p-5">
//                     {/* Title */}
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
//                       {election.title}
//                     </h3>

//                     {/* Description */}
//                     <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
//                       {election.description || 'No description'}
//                     </p>

//                     {/* Meta Info */}
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

//                     {/* Actions */}
//                     <div className="grid grid-cols-2 gap-2">
//                       <button
//                         onClick={() => handleView(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEye /> View
//                       </button>
//                       <button
//                         onClick={() => handleEdit(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEdit /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleShare(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                       >
//                         <FaShare /> Share
//                       </button>
//                       <button
//                         onClick={() => handleClone(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
//                       >
//                         <FaCopy /> Clone
//                       </button>
//                       <button
//                         onClick={() => handleDeleteClick(election)}
//                         className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
//                       >
//                         <FaTrash /> Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// // Import your existing API functions
// //import { getMyElections, deleteElection, cloneElection } from '../../../api/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // State
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       console.log('📤 Fetching elections - Page:', currentPage, 'Status:', statusFilter);
      
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
//       );
      
//       console.log('📥 Full API Response:', response);
      
//       if (response && response.data) {
//         const electionsData = response.data.elections || [];
//         const total = response.data.total || 0;
//         const limit = response.data.limit || ITEMS_PER_PAGE;
        
//         console.log('✅ Elections loaded:', electionsData.length);
//         console.log('📊 Elections data:', electionsData);
        
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

//   // Filter by search
//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handlers
//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     // Navigate to election view page
//     navigate(`/election/${election.id}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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

//   // Helper to get image URL - handles both full URLs and relative paths
//   const getImageUrl = (imageUrl) => {
//     if (!imageUrl) return null;
    
//     // If it's already a full URL, return it
//     if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//       return imageUrl;
//     }
    
//     // If it's a relative path, prepend your backend URL
//     const backendUrl = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005';
//     const baseUrl = backendUrl.replace('/api', ''); // Remove /api if present
    
//     // Remove leading slash if present to avoid double slashes
//     const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
//     return `${baseUrl}${cleanPath}`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
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

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         // Empty State
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => {
//               const imageUrl = getImageUrl(election.topic_image_url);
              
//               return (
//                 <div
//                   key={election.id}
//                   className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//                 >
//                   {/* Image Thumbnail */}
//                   <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                     {imageUrl ? (
//                       <>
//                         <img
//                           src={imageUrl}
//                           alt={election.title}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                           onError={(e) => {
//                             console.log('Image failed to load:', imageUrl);
//                             e.target.style.display = 'none';
//                             e.target.nextSibling.style.display = 'flex';
//                           }}
//                         />
//                         <div className="w-full h-full hidden items-center justify-center">
//                           <FaImage className="text-6xl text-gray-300" />
//                         </div>
//                       </>
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <FaImage className="text-6xl text-gray-300" />
//                       </div>
//                     )}
//                     <div className="absolute top-3 right-3">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(election.status)}`}>
//                         {getStatusLabel(election.status)}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="p-5">
//                     {/* Title */}
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
//                       {election.title}
//                     </h3>

//                     {/* Description */}
//                     <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
//                       {election.description || 'No description'}
//                     </p>

//                     {/* Meta Info */}
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

//                     {/* Actions */}
//                     <div className="grid grid-cols-2 gap-2">
//                       <button
//                         onClick={() => handleView(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEye /> View
//                       </button>
//                       <button
//                         onClick={() => handleEdit(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
//                       >
//                         <FaEdit /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleShare(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                       >
//                         <FaShare /> Share
//                       </button>
//                       <button
//                         onClick={() => handleClone(election)}
//                         className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
//                       >
//                         <FaCopy /> Clone
//                       </button>
//                       <button
//                         onClick={() => handleDeleteClick(election)}
//                         className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
//                       >
//                         <FaTrash /> Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaImage,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// // Import your existing API functions
// //import { getMyElections, deleteElection, cloneElection } from '../../../api/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // State
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       console.log('📤 Fetching elections - Page:', currentPage, 'Status:', statusFilter);
      
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
//       );
      
//       console.log('📥 Full API Response:', response);
      
//       if (response && response.data) {
//         const electionsData = response.data.elections || [];
//         const total = response.data.total || 0;
//         const limit = response.data.limit || ITEMS_PER_PAGE;
        
//         console.log('✅ Elections loaded:', electionsData.length);
        
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

//   // Filter by search
//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handlers
//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     // Navigate to election view page
//     navigate(`/election/${election.id}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
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

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         // Empty State
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//               >
//                 {/* Image Thumbnail */}
//                 <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
//                   {election.topic_image_url ? (
//                     <img
//                       src={election.topic_image_url}
//                       alt={election.title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.nextSibling.style.display = 'flex';
//                       }}
//                     />
//                   ) : null}
//                   <div 
//                     className={`w-full h-full flex items-center justify-center ${election.topic_image_url ? 'hidden' : 'flex'}`}
//                   >
//                     <FaImage className="text-6xl text-gray-300" />
//                   </div>
//                   <div className="absolute top-3 right-3">
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(election.status)}`}>
//                       {getStatusLabel(election.status)}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-5">
//                   {/* Title */}
//                   <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
//                     {election.title}
//                   </h3>

//                   {/* Description */}
//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
//                     {election.description || 'No description'}
//                   </p>

//                   {/* Meta Info */}
//                   <div className="space-y-2 mb-4 text-sm">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <FaCalendar className="text-gray-400 flex-shrink-0" />
//                       <span className="truncate text-xs">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                         {election.voting_type || 'Plurality'}
//                       </span>
//                       <div className="flex gap-3 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <FaVoteYea /> {election.vote_count || 0}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FaEye /> {election.view_count || 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       onClick={() => handleView(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors"
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleShare(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition-colors"
//                     >
//                       <FaShare /> Share
//                     </button>
//                     <button
//                       onClick={() => handleClone(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors"
//                     >
//                       <FaCopy /> Clone
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(election)}
//                       className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
//                     >
//                       <FaTrash /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// // Import your existing API functions
// //import { getMyElections, deleteElection, cloneElection } from '../../../api/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // State
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       console.log('📤 Fetching elections - Page:', currentPage, 'Status:', statusFilter);
      
//       // Call your existing API function
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
//       );
      
//       console.log('📥 Full API Response:', response);
      
//       // Your backend wraps response in formatResponse:
//       // { success: true, data: { elections: [...], total, page, limit }, message: '...' }
      
//       if (response && response.data) {
//         const electionsData = response.data.elections || [];
//         const total = response.data.total || 0;
//         const limit = response.data.limit || ITEMS_PER_PAGE;
        
//         console.log('✅ Elections loaded:', electionsData.length);
//         console.log('📊 Total in DB:', total);
        
//         setElections(electionsData);
//         setTotalElections(total);
//         setTotalPages(Math.ceil(total / limit));
//       } else if (response && response.elections) {
//         // Fallback: if response structure is different
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
//       console.error('❌ Error response:', error.response);
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

//   // Filter by search
//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handlers
//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/vote/${election.slug}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
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

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         // Empty State
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//               >
//                 {/* Color Bar */}
//                 <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
//                 <div className="p-5">
//                   {/* Title and Status */}
//                   <div className="flex items-start justify-between mb-3">
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
//                       {election.title}
//                     </h3>
//                     <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(election.status)}`}>
//                       {getStatusLabel(election.status)}
//                     </span>
//                   </div>

//                   {/* Description */}
//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                     {election.description || 'No description'}
//                   </p>

//                   {/* Meta Info */}
//                   <div className="space-y-2 mb-4 text-sm">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <FaCalendar className="text-gray-400 flex-shrink-0" />
//                       <span className="truncate">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                         {election.voting_type || 'Plurality'}
//                       </span>
//                       <div className="flex gap-3 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <FaVoteYea /> {election.vote_count || 0}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FaEye /> {election.view_count || 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       onClick={() => handleView(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleShare(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium"
//                     >
//                       <FaShare /> Share
//                     </button>
//                     <button
//                       onClick={() => handleClone(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium"
//                     >
//                       <FaCopy /> Clone
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(election)}
//                       className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
//                     >
//                       <FaTrash /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { cloneElection, deleteElection, getMyElections } from '../../../redux/api/election/electionApi';

// // Import your existing API functions
// //import { getMyElections, deleteElection, cloneElection } from '../../../api/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // State
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       console.log('📤 Fetching elections - Page:', currentPage, 'Status:', statusFilter);
      
//       // Call your existing API function with status parameter
//       const response = await getMyElections(
//         currentPage, 
//         ITEMS_PER_PAGE, 
//         statusFilter !== 'all' ? statusFilter : null
//       );
      
//       console.log('📥 API Response:', response);
      
//       // Your API returns data directly, not wrapped in { success, data }
//       if (response) {
//         const electionsData = response.elections || [];
//         const paginationData = response.pagination || {};
        
//         console.log('✅ Elections loaded:', electionsData.length);
        
//         setElections(electionsData);
//         setTotalPages(paginationData.totalPages || 1);
//         setTotalElections(paginationData.total || 0);
//       } else {
//         throw new Error('No response data');
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

//   // Filter by search
//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handlers
//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       await deleteElection(deleteModal.electionId);
//       toast.success('Election deleted successfully');
//       setDeleteModal({ show: false, electionId: null, title: '' });
//       fetchElections();
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to delete election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       await cloneElection(election.id, newTitle);
//       toast.success('Election cloned successfully');
//       fetchElections();
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to clone election';
//       toast.error(errorMessage);
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/vote/${election.slug}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
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

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         // Empty State
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//               >
//                 {/* Color Bar */}
//                 <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
//                 <div className="p-5">
//                   {/* Title and Status */}
//                   <div className="flex items-start justify-between mb-3">
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
//                       {election.title}
//                     </h3>
//                     <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(election.status)}`}>
//                       {getStatusLabel(election.status)}
//                     </span>
//                   </div>

//                   {/* Description */}
//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                     {election.description || 'No description'}
//                   </p>

//                   {/* Meta Info */}
//                   <div className="space-y-2 mb-4 text-sm">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <FaCalendar className="text-gray-400 flex-shrink-0" />
//                       <span className="truncate">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                         {election.voting_type || 'Plurality'}
//                       </span>
//                       <div className="flex gap-3 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <FaVoteYea /> {election.vote_count || 0}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FaEye /> {election.view_count || 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       onClick={() => handleView(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleShare(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium"
//                     >
//                       <FaShare /> Share
//                     </button>
//                     <button
//                       onClick={() => handleClone(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium"
//                     >
//                       <FaCopy /> Clone
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(election)}
//                       className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
//                     >
//                       <FaTrash /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaCheckCircle,
// } from 'react-icons/fa';

// const API_BASE_URL =import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005';

// // Get user data from localStorage
// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   const userId = localStorage.getItem('userId');
  
//   if (userDataStr) {
//     try {
//       return JSON.parse(userDataStr);
//     } catch (e) {
//       console.error('Error parsing userData:', e);
//     }
//   }
  
//   // Fallback
//   return {
//     userId: parseInt(userId) || null,
//     email: localStorage.getItem('email') || '',
//     phone: localStorage.getItem('phone') || null,
//     username: localStorage.getItem('username') || '',
//     roles: ['Admin', 'Voter', 'ContentCreator', 'Manager'],
//     subscriptionType: localStorage.getItem('subscriptionType') || 'Free',
//     isSubscribed: localStorage.getItem('isSubscribed') === 'true'
//   };
// };

// // Get headers with user data
// const getHeaders = () => {
//   const userData = getUserData();
//   console.log('📤 Sending user data in x-user-data header:', userData);
  
//   return {
//     'Content-Type': 'application/json',
//     'x-user-data': JSON.stringify(userData),
//   };
// };

// // API Functions inline
// const fetchWithUserData = async (url, options = {}) => {
//   const defaultOptions = {
//     credentials: 'include',
//     headers: getHeaders(),
//   };
  
//   const mergedOptions = {
//     ...defaultOptions,
//     ...options,
//     headers: {
//       ...defaultOptions.headers,
//       ...options.headers,
//     },
//   };
  
//   console.log('🔗 Fetching:', url);
  
//   const response = await fetch(url, mergedOptions);
//   const data = await response.json();
  
//   console.log('📥 Status:', response.status, 'Data:', data);
  
//   return { response, data };
// };

// const getMyElections = async (page = 1, limit = 10, status = null) => {
//   try {
//     let url = `${API_BASE_URL}/elections/my-elections?page=${page}&limit=${limit}`;
//     if (status && status !== 'all') {
//       url += `&status=${status}`;
//     }

//     const { response, data } = await fetchWithUserData(url, { method: 'GET' });

//     if (!response.ok) {
//       throw new Error(data.message || `HTTP ${response.status}`);
//     }

//     return {
//       success: true,
//       data: data,
//       message: 'Elections fetched successfully',
//     };
//   } catch (error) {
//     console.error('❌ Error fetching elections:', error);
//     return {
//       success: false,
//       message: error.message,
//       data: { elections: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } },
//     };
//   }
// };

// const deleteElection = async (electionId) => {
//   try {
//     const { response, data } = await fetchWithUserData(
//       `${API_BASE_URL}/elections/${electionId}`,
//       { method: 'DELETE' }
//     );

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to delete election');
//     }

//     return {
//       success: true,
//       message: data.message || 'Election deleted successfully',
//     };
//   } catch (error) {
//     console.error('Error deleting election:', error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// };

// const cloneElection = async (electionId, newTitle) => {
//   try {
//     const { response, data } = await fetchWithUserData(
//       `${API_BASE_URL}/elections/${electionId}/clone`,
//       {
//         method: 'POST',
//         body: JSON.stringify({ newTitle }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to clone election');
//     }

//     return {
//       success: true,
//       data: data,
//       message: data.message || 'Election cloned successfully',
//     };
//   } catch (error) {
//     console.error('Error cloning election:', error);
//     return {
//       success: false,
//       message: error.message,
//       data: null,
//     };
//   }
// };

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   useEffect(() => {
//     console.log('✨ AllElections Component - FINAL VERSION with x-user-data header');
//     console.log('👤 User data:', getUserData());
//   }, []);

//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       const response = await getMyElections(currentPage, ITEMS_PER_PAGE, statusFilter !== 'all' ? statusFilter : null);
      
//       if (response.success) {
//         const electionsData = response.data.elections || [];
//         const paginationData = response.data.pagination || {};
        
//         console.log('✅ Elections loaded:', electionsData.length);
        
//         setElections(electionsData);
//         setTotalPages(paginationData.totalPages || 1);
//         setTotalElections(paginationData.total || 0);
//       } else {
//         console.error('❌ API Error:', response.message);
//         setApiError(response.message);
//         toast.error(response.message || 'Failed to fetch elections');
//       }
//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setApiError(error.message);
//       toast.error('Failed to load elections');
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

//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       const response = await deleteElection(deleteModal.electionId);
//       if (response.success) {
//         toast.success('Election deleted successfully');
//         setDeleteModal({ show: false, electionId: null, title: '' });
//         fetchElections();
//       } else {
//         toast.error(response.message || 'Failed to delete election');
//       }
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       toast.error('Failed to delete election');
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       const response = await cloneElection(election.id, newTitle);
      
//       if (response.success) {
//         toast.success('Election cloned successfully');
//         fetchElections();
//       } else {
//         toast.error(response.message || 'Failed to clone election');
//       }
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       toast.error('Failed to clone election');
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/vote/${election.slug}`);
//   };

//   const handleEdit = (election) => {
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
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
//       {/* Success Banner */}
//       <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
//         <div className="flex items-start">
//           <FaCheckCircle className="text-green-500 mt-1 mr-3" />
//           <div className="text-sm">
//             <p className="font-semibold text-green-800">✅ Final Version Active</p>
//             <p className="text-green-700">Using x-user-data header authentication</p>
//           </div>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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

//       {/* Search and Filter */}
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
//           <p className="text-gray-600">Loading your elections...</p>
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
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
//             {filteredElections.map((election) => (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//               >
//                 <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
//                 <div className="p-5">
//                   <div className="flex items-start justify-between mb-3">
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
//                       {election.title}
//                     </h3>
//                     <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(election.status)}`}>
//                       {getStatusLabel(election.status)}
//                     </span>
//                   </div>

//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                     {election.description || 'No description'}
//                   </p>

//                   <div className="space-y-2 mb-4 text-sm">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <FaCalendar className="text-gray-400 flex-shrink-0" />
//                       <span className="truncate">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                         {election.voting_type || 'Plurality'}
//                       </span>
//                       <div className="flex gap-3 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <FaVoteYea /> {election.vote_count || 0}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FaEye /> {election.view_count || 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       onClick={() => handleView(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleShare(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium"
//                     >
//                       <FaShare /> Share
//                     </button>
//                     <button
//                       onClick={() => handleClone(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium"
//                     >
//                       <FaCopy /> Clone
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(election)}
//                       className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
//                     >
//                       <FaTrash /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
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

//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   FaPlus,
//   FaSearch,
//   FaEye,
//   FaEdit,
//   FaTrash,
//   FaCopy,
//   FaShare,
//   FaCalendar,
//   FaVoteYea,
//   FaFilter,
//   FaChevronLeft,
//   FaChevronRight,
//   FaExclamationCircle,
// } from 'react-icons/fa';

// // API BASE URL - Update this if needed
// const API_BASE_URL = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005/api';

// // API Functions - Inline to avoid import issues
// const getMyElections = async (page = 1, limit = 10, status = null) => {
//   try {
//     const token = localStorage.getItem('accessToken');
    
//     let url = `${API_BASE_URL}/elections/my-elections?page=${page}&limit=${limit}`;
//     if (status && status !== 'all') {
//       url += `&status=${status}`;
//     }

//     console.log('🔍 Fetching elections from:', url);

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//     });

//     const data = await response.json();
//     console.log('📥 API Response:', data);

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to fetch elections');
//     }

//     return {
//       success: true,
//       data: data,
//       message: 'Elections fetched successfully',
//     };
//   } catch (error) {
//     console.error('❌ Error fetching elections:', error);
//     return {
//       success: false,
//       message: error.message,
//       data: { elections: [], pagination: { total: 0, totalPages: 0, currentPage: 1 } },
//     };
//   }
// };

// const deleteElection = async (electionId) => {
//   try {
//     const token = localStorage.getItem('accessToken');

//     const response = await fetch(`${API_BASE_URL}/elections/${electionId}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to delete election');
//     }

//     return {
//       success: true,
//       message: data.message || 'Election deleted successfully',
//     };
//   } catch (error) {
//     console.error('Error deleting election:', error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// };

// const cloneElection = async (electionId, newTitle) => {
//   try {
//     const token = localStorage.getItem('accessToken');

//     const response = await fetch(`${API_BASE_URL}/elections/${electionId}/clone`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify({ newTitle }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to clone election');
//     }

//     return {
//       success: true,
//       data: data,
//       message: data.message || 'Election cloned successfully',
//     };
//   } catch (error) {
//     console.error('Error cloning election:', error);
//     return {
//       success: false,
//       message: error.message,
//       data: null,
//     };
//   }
// };

// export default function AllElections() {
//   const navigate = useNavigate();
  
//   // State
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElections, setTotalElections] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [deleteModal, setDeleteModal] = useState({ show: false, electionId: null, title: '' });
//   const [apiError, setApiError] = useState(null);
  
//   const ITEMS_PER_PAGE = 9;

//   // Debug info
//   useEffect(() => {
//     console.log('🎯 AllElections Component Mounted - ENHANCED VERSION');
//     console.log('📍 API Base URL:', API_BASE_URL);
//     console.log('🔑 Access Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
//   }, []);

//   // Fetch Elections
//   const fetchElections = useCallback(async () => {
//     try {
//       setLoading(true);
//       setApiError(null);
      
//       const params = {
//         page: currentPage,
//         limit: ITEMS_PER_PAGE,
//       };
      
//       if (statusFilter !== 'all') {
//         params.status = statusFilter;
//       }
      
//       console.log('📤 Fetching elections with params:', params);
      
//       const response = await getMyElections(params.page, params.limit, params.status);
      
//       console.log('📦 Response received:', response);
      
//       if (response.success) {
//         const electionsData = response.data.elections || [];
//         const paginationData = response.data.pagination || {};
        
//         console.log('✅ Elections loaded:', electionsData.length);
        
//         setElections(electionsData);
//         setTotalPages(paginationData.totalPages || 1);
//         setTotalElections(paginationData.total || 0);
//       } else {
//         console.error('❌ API Error:', response.message);
//         setApiError(response.message);
//         toast.error(response.message || 'Failed to fetch elections');
//       }
//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setApiError(error.message);
//       toast.error('Failed to load elections');
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, statusFilter]);

//   useEffect(() => {
//     fetchElections();
//   }, [fetchElections]);

//   // Filter by search
//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     election.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Handlers
//   const handleDeleteClick = (election) => {
//     setDeleteModal({ show: true, electionId: election.id, title: election.title });
//   };

//   const confirmDelete = async () => {
//     try {
//       const response = await deleteElection(deleteModal.electionId);
//       if (response.success) {
//         toast.success('Election deleted successfully');
//         setDeleteModal({ show: false, electionId: null, title: '' });
//         fetchElections();
//       } else {
//         toast.error(response.message || 'Failed to delete election');
//       }
//     } catch (error) {
//       console.error('Error deleting election:', error);
//       toast.error('Failed to delete election');
//     }
//   };

//   const handleClone = async (election) => {
//     try {
//       const newTitle = `${election.title} (Copy)`;
//       const response = await cloneElection(election.id, newTitle);
      
//       if (response.success) {
//         toast.success('Election cloned successfully');
//         fetchElections();
//       } else {
//         toast.error(response.message || 'Failed to clone election');
//       }
//     } catch (error) {
//       console.error('Error cloning election:', error);
//       toast.error('Failed to clone election');
//     }
//   };

//   const handleShare = (election) => {
//     const shareUrl = `https://prod-client-omega.vercel.app/vote/${election.slug}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success('Link copied to clipboard!');
//   };

//   const handleView = (election) => {
//     navigate(`/vote/${election.slug}`);
//   };

//   const handleEdit = (election) => {
//     // Navigate to create-election tab with the election id
//     navigate('/dashboard', { state: { editElectionId: election.id, activeTab: 'create-election' } });
//     toast.info('Edit functionality: Navigate to create tab with election ID');
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
//       {/* Debug Banner - Remove after confirming it works */}
//       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
//         <div className="flex items-start">
//           <FaExclamationCircle className="text-blue-500 mt-1 mr-3" />
//           <div className="text-sm">
//             <p className="font-semibold text-blue-800">Enhanced Version Active ✅</p>
//             <p className="text-blue-700">Loaded {elections.length} elections from API</p>
//           </div>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">All Elections</h2>
//           <p className="text-gray-600 mt-1">{totalElections} total elections</p>
//         </div>
//         <button
//           onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           <FaPlus />
//           <span>Create Election</span>
//         </button>
//       </div>

//       {/* API Error Alert */}
//       {apiError && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <div className="flex items-start">
//             <FaExclamationCircle className="text-red-500 mt-1 mr-3" />
//             <div>
//               <h3 className="font-semibold text-red-800">API Error</h3>
//               <p className="text-sm text-red-700">{apiError}</p>
//               <button
//                 onClick={fetchElections}
//                 className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Search and Filter */}
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

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       ) : filteredElections.length === 0 ? (
//         // Empty State
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
//               onClick={() => navigate('/dashboard', { state: { activeTab: 'create-election' } })}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
//             >
//               <FaPlus />
//               Create Your First Election
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Elections Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredElections.map((election) => (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
//               >
//                 {/* Color Bar */}
//                 <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
//                 <div className="p-5">
//                   {/* Title and Status */}
//                   <div className="flex items-start justify-between mb-3">
//                     <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
//                       {election.title}
//                     </h3>
//                     <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(election.status)}`}>
//                       {getStatusLabel(election.status)}
//                     </span>
//                   </div>

//                   {/* Description */}
//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                     {election.description || 'No description'}
//                   </p>

//                   {/* Meta Info */}
//                   <div className="space-y-2 mb-4 text-sm">
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <FaCalendar className="text-gray-400 flex-shrink-0" />
//                       <span className="truncate">{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                         {election.voting_type || 'Plurality'}
//                       </span>
//                       <div className="flex gap-3 text-xs text-gray-500">
//                         <span className="flex items-center gap-1">
//                           <FaVoteYea /> {election.vote_count || 0}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <FaEye /> {election.view_count || 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="grid grid-cols-2 gap-2">
//                     <button
//                       onClick={() => handleView(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleShare(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium"
//                     >
//                       <FaShare /> Share
//                     </button>
//                     <button
//                       onClick={() => handleClone(election)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium"
//                     >
//                       <FaCopy /> Clone
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(election)}
//                       className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
//                     >
//                       <FaTrash /> Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
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

//       {/* Delete Modal */}
//       {deleteModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaTrash className="text-red-600 text-2xl" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
//               <p className="text-gray-600">
//                 Delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteModal({ show: false, electionId: null, title: '' })}
//                 className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
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
// import React from 'react';

// export default function AllElections() {
//   const elections = [
//     {
//       id: 1,
//       title: 'Feature Request',
//       creator: 'John Doe',
//       status: 'Active',
//       votes: 370,
//       participants: 156,
//       endDate: '2 days',
//     },
//     {
//       id: 2,
//       title: 'Design Theme',
//       creator: 'Jane Smith',
//       status: 'Completed',
//       votes: 568,
//       participants: 234,
//       endDate: 'Completed',
//     },
//     {
//       id: 3,
//       title: 'API Updates',
//       creator: 'Admin',
//       status: 'Active',
//       votes: 289,
//       participants: 123,
//       endDate: '5 days',
//     },
//   ];

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">All Elections shakil</h1>

//       {/* Filters */}
//       <div className="flex gap-2 mb-6 flex-wrap">
//         <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">All</button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">Active</button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">Completed</button>
//       </div>

//       {/* Elections List */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {elections.map((election) => (
//           <div key={election.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
//             <div className="flex justify-between items-start mb-2">
//               <h3 className="text-lg font-bold">{election.title}</h3>
//               <span
//                 className={`text-xs px-2 py-1 rounded ${
//                   election.status === 'Active'
//                     ? 'bg-green-100 text-green-800'
//                     : 'bg-gray-100 text-gray-800'
//                 }`}
//               >
//                 {election.status}
//               </span>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">by {election.creator}</p>

//             <div className="space-y-2 mb-4">
//               <div className="flex justify-between">
//                 <span className="text-sm text-gray-600">Total Votes</span>
//                 <span className="font-semibold">{election.votes}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-sm text-gray-600">Participants</span>
//                 <span className="font-semibold">{election.participants}</span>
//               </div>
//             </div>

//             <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
//               {election.status === 'Active' ? 'Vote Now' : 'View Results'}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }