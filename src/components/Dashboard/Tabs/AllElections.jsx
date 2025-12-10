//All Elections - Shows ALL elections for any authenticated user
//Edit and Delete only visible for elections owned by logged-in user
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  
  // Get logged-in user from Redux store
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?.userId || user?.id || user?.user_id;
  
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

  // Check if the logged-in user owns this election
  const isOwner = (election) => {
    if (!currentUserId) return false;
    const electionOwnerId = election.created_by || election.creator_id || election.user_id || election.owner_id;
    return String(currentUserId) === String(electionOwnerId);
  };

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

  const handleShare = (election) => {
    // Use election SLUG (not ID) for the public voting page
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
            {filteredElections.map((election) => {
              const userOwnsElection = isOwner(election);
              
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

                    {/* Action Buttons - Conditional based on ownership */}
                    <div className="space-y-2">
                      {/* Row 1: View & Share - Always visible */}
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

                      {/* Row 2: Edit & Clone - Edit only for owner */}
                      <div className="grid grid-cols-2 gap-2">
                        {userOwnsElection ? (
                          <button
                            onClick={() => handleEdit(election)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium transition-colors"
                          >
                            <FaEdit /> Edit
                          </button>
                        ) : (
                          <div /> // Empty placeholder to maintain grid
                        )}
                        <button
                          onClick={() => handleClone(election)}
                          className={`flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium transition-colors ${!userOwnsElection ? 'col-span-2' : ''}`}
                        >
                          <FaCopy /> Clone
                        </button>
                      </div>

                      {/* Row 3: Delete - Only for owner */}
                      {userOwnsElection && (
                        <button
                          onClick={() => handleDeleteClick(election)}
                          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
                        >
                          <FaTrash /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
//last successfull workable code, only edit and delete button for looged in users
// //All Elections - Shows ALL elections for any authenticated user
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
// import { cloneElection, deleteElection, getAllElections } from '../../../redux/api/election/electionApi';

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

//   // const handleShare = (election) => {
//   //   // ✅ Use election ID (not slug)
//   //   const shareUrl = `${window.location.origin}/vote/${election.id}`;
//   //   navigator.clipboard.writeText(shareUrl);
//   //   toast.success('Link copied to clipboard!');
//   // };
//   const handleShare = (election) => {
//   // ✅ Use election SLUG (not ID) for the public voting page
//   const shareUrl = `${window.location.origin}/vote/${election.slug}`;
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
