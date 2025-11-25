// src/components/Dashboard/Tabs/election/MyElections.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Share2,
  BarChart3,
  Gift,
  Loader,
  Trash2,
  Copy
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetMyElectionsQuery } from '../../../../redux/api/election/electionApi';
import { deleteElection, cloneElection } from '../../../../redux/api/election/electionApi';

export default function MyElections() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [cloneModal, setCloneModal] = useState(null);
  const [cloneTitle, setCloneTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const { data: electionsData, isLoading, error, refetch } = useGetMyElectionsQuery({
    page: 1,
    limit: 100,
    status: null
  });

  // Handle different response structures
  const myElections = electionsData?.elections || electionsData?.data?.elections || electionsData?.data || [];

  console.log('Elections Data:', electionsData);
  console.log('My Elections:', myElections);

  const filteredElections = myElections.filter(election => {
    if (filter === 'all') return true;
    return election.status?.toLowerCase() === filter;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const calculateRevenue = (election) => {
    const votes = election.total_votes || 0;
    const fee = parseFloat(election.general_participation_fee || 0);
    return (votes * fee).toFixed(2);
  };

  // ✅ Navigate to election view with source = 'my-elections'
  const handleViewElection = (electionId) => {
    navigate(`/election/${electionId}`, { 
      state: { source: 'my-elections' }
    });
  };

  // ✅ Handle Edit - Navigate to create-election route with edit param
  const handleEditElection = (election) => {
    navigate(`/dashboard/create-election?edit=${election.id}`);
  };

  // ✅ Handle Delete - Open confirmation modal (backend will validate on confirm)
  const handleDeleteElection = (election) => {
    setDeleteModal(election);
  };

  // ✅ Confirm Delete
  const confirmDelete = async () => {
    if (!deleteModal) return;
    
    setIsDeleting(true);
    try {
      const response = await deleteElection(deleteModal.id);
      if (response.success) {
        toast.success('Election deleted successfully');
        setDeleteModal(null);
        refetch();
      } else {
        toast.error(response.message || 'Failed to delete election');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete election');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Handle Clone - Open modal (backend will validate on confirm)
  const handleCloneElection = (election) => {
    setCloneModal(election);
    setCloneTitle(`${election.title} (Copy)`);
  };

  // ✅ Confirm Clone
  const confirmClone = async () => {
    if (!cloneModal || !cloneTitle.trim()) {
      toast.error('Please enter a title for the cloned election');
      return;
    }
    
    setIsCloning(true);
    try {
      const response = await cloneElection(cloneModal.id, cloneTitle.trim());
      if (response.success) {
        toast.success('Election cloned successfully!');
        setCloneModal(null);
        setCloneTitle('');
        refetch();
        
        // Optionally navigate to edit the new election
        if (response.data?.id) {
          toast.info('Redirecting to edit the cloned election...');
          setTimeout(() => {
            navigate(`/dashboard/create-election?edit=${response.data.id}`);
          }, 1500);
        }
      } else {
        toast.error(response.message || 'Failed to clone election');
      }
    } catch (error) {
      console.error('Clone error:', error);
      toast.error(error.response?.data?.message || 'Failed to clone election');
    } finally {
      setIsCloning(false);
    }
  };

  // ✅ Handle Share
  const handleShareElection = (election) => {
    const url = `${window.location.origin}/vote/${election.slug || election.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Election link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-red-600 mb-4">Error loading elections</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Elections</h1>
          <p className="text-gray-600 mt-1">Manage and track your created elections</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Elections</p>
            <BarChart3 className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">{myElections.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active</p>
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {myElections.filter(e => e.status === 'published').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Votes</p>
            <Users className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {myElections.reduce((sum, e) => sum + (e.total_votes || 0), 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${myElections.reduce((sum, e) => sum + parseFloat(calculateRevenue(e)), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All Elections', count: myElections.length },
            { value: 'published', label: 'Active', count: myElections.filter(e => e.status === 'published').length },
            { value: 'draft', label: 'Drafts', count: myElections.filter(e => e.status === 'draft').length },
            { value: 'completed', label: 'Completed', count: myElections.filter(e => e.status === 'completed').length },
            { value: 'cancelled', label: 'Cancelled', count: myElections.filter(e => e.status === 'cancelled').length },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Elections Grid */}
      {filteredElections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No Elections Created Yet' : `No ${filter} Elections`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Start by creating your first election to engage your audience"
              : `You don't have any ${filter} elections at the moment`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => {
            // ✅ Check both total_votes and vote_count (backend returns vote_count)
            const voteCount = election.total_votes || election.vote_count || 0;
            const hasActiveVotes = voteCount > 0 || election.status === 'active';
            
            return (
              <div
                key={election.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Card Header with Image */}
                {election.media_url || election.topic_image_url ? (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    <img
                      src={election.media_url || election.topic_image_url}
                      alt={election.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
                        {election.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                    <span className="text-6xl">🗳️</span>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
                        {election.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {election.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {election.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="text-purple-600" size={16} />
                      <div>
                        <p className="text-xs text-gray-600">Participants</p>
                        <p className="font-semibold text-gray-900">{voteCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="text-blue-600" size={16} />
                      <div>
                        <p className="text-xs text-gray-600">Views</p>
                        <p className="font-semibold text-gray-900">{election.views || election.view_count || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Box */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Participation Fee</span>
                      <span className="font-semibold text-green-700">
                        ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        ${calculateRevenue(election)}
                      </span>
                    </div>
                  </div>

                  {/* Gamification Badge */}
                  {(election.is_gamified || election.lottery_enabled) && (
                    <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-2">
                      <Gift className="text-purple-600" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Prize Pool</p>
                        <p className="font-semibold text-purple-700">
                          ${parseFloat(election.total_prize_pool || election.lottery_total_prize_pool || 0).toFixed(2)}
                        </p>
                      </div>
                      {election.has_lottery_ended ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Clock className="text-orange-600" size={20} />
                      )}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar size={14} />
                      <span>Start: {new Date(election.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>End: {new Date(election.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {election.voting_type || 'plurality'}
                    </span>
                    {election.allow_vote_editing && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        Editable
                      </span>
                    )}
                    {election.biometric_required && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Biometric
                      </span>
                    )}
                    {hasActiveVotes && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Has Votes
                      </span>
                    )}
                  </div>

                  {/* ✅ Action Buttons - View, Edit, Clone, Share, Delete */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {/* View Button */}
                    <button
                      onClick={() => handleViewElection(election.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      title="View election details"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    
                    {/* ✅ Edit Button - Always enabled, backend validates */}
                    <button
                      onClick={() => handleEditElection(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                      title="Edit election"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    {/* ✅ Clone Button - Always enabled, backend validates */}
                    <button
                      onClick={() => handleCloneElection(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      title="Clone this election"
                    >
                      <Copy size={14} />
                      Clone
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Share Button */}
                    <button
                      onClick={() => handleShareElection(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                      title="Copy shareable link"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                    
                    {/* ✅ Delete Button - Always enabled, backend validates */}
                    <button
                      onClick={() => handleDeleteElection(election)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      title="Delete election"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Election?</h3>
              <p className="text-gray-600">
                Are you sure you want to delete "<strong>{deleteModal.title}</strong>"?
              </p>
              <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Clone Modal */}
      {cloneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Copy className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Clone Election</h3>
              <p className="text-gray-600 mb-4">
                Create a copy of "<strong>{cloneModal.title}</strong>"
              </p>
              
              {/* Clone Title Input */}
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Election Title
                </label>
                <input
                  type="text"
                  value={cloneTitle}
                  onChange={(e) => setCloneTitle(e.target.value)}
                  placeholder="Enter title for cloned election"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCloneModal(null);
                  setCloneTitle('');
                }}
                disabled={isCloning}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClone}
                disabled={isCloning || !cloneTitle.trim()}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCloning ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Cloning...
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Clone Election
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//last working code but only disable edit and delete above code
// // src/components/Dashboard/Tabs/MyElections.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Calendar,
//   Users,
//   Eye,
//   DollarSign,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Edit,
//   Share2,
//   BarChart3,
//   Gift,
//   Loader
// } from 'lucide-react';
// import { useGetMyElectionsQuery } from '../../../../redux/api/election/electionApi';
// //import { useGetMyElectionsQuery } from '../../../redux/api/election/electionApi';

// export default function MyElections() {
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState('all');

//   const { data: electionsData, isLoading, error } = useGetMyElectionsQuery({
//     page: 1,
//     limit: 100,
//     status: null
//   });

//   // Handle different response structures
//   const myElections = electionsData?.elections || electionsData?.data?.elections || electionsData?.data || [];

//   console.log('Elections Data:', electionsData);
//   console.log('My Elections:', myElections);

//   const filteredElections = myElections.filter(election => {
//     if (filter === 'all') return true;
//     return election.status?.toLowerCase() === filter;
//   });

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'published':
//         return 'bg-green-100 text-green-700';
//       case 'completed':
//         return 'bg-blue-100 text-blue-700';
//       case 'draft':
//         return 'bg-gray-100 text-gray-700';
//       case 'cancelled':
//         return 'bg-red-100 text-red-700';
//       default:
//         return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const calculateRevenue = (election) => {
//     const votes = election.total_votes || 0;
//     const fee = parseFloat(election.general_participation_fee || 0);
//     return (votes * fee).toFixed(2);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your elections...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 mb-4">Error loading elections</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">My Elections</h1>
//           <p className="text-gray-600 mt-1">Manage and track your created elections</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm text-gray-600">Total Elections</p>
//             <BarChart3 className="text-blue-600" size={24} />
//           </div>
//           <p className="text-3xl font-bold text-blue-600">{myElections.length}</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm text-gray-600">Active</p>
//             <CheckCircle className="text-green-600" size={24} />
//           </div>
//           <p className="text-3xl font-bold text-green-600">
//             {myElections.filter(e => e.status === 'published').length}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm text-gray-600">Total Votes</p>
//             <Users className="text-purple-600" size={24} />
//           </div>
//           <p className="text-3xl font-bold text-purple-600">
//             {myElections.reduce((sum, e) => sum + (e.total_votes || 0), 0)}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <div className="flex items-center justify-between mb-2">
//             <p className="text-sm text-gray-600">Total Revenue</p>
//             <DollarSign className="text-green-600" size={24} />
//           </div>
//           <p className="text-3xl font-bold text-green-600">
//             ${myElections.reduce((sum, e) => sum + parseFloat(calculateRevenue(e)), 0).toFixed(2)}
//           </p>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="flex gap-2 overflow-x-auto">
//           {[
//             { value: 'all', label: 'All Elections', count: myElections.length },
//             { value: 'published', label: 'Active', count: myElections.filter(e => e.status === 'published').length },
//             { value: 'draft', label: 'Drafts', count: myElections.filter(e => e.status === 'draft').length },
//             { value: 'completed', label: 'Completed', count: myElections.filter(e => e.status === 'completed').length },
//             { value: 'cancelled', label: 'Cancelled', count: myElections.filter(e => e.status === 'cancelled').length },
//           ].map((f) => (
//             <button
//               key={f.value}
//               onClick={() => setFilter(f.value)}
//               className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
//                 filter === f.value
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {f.label} ({f.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {filteredElections.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-12 text-center">
//           <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">
//             {filter === 'all' ? 'No Elections Created Yet' : `No ${filter} Elections`}
//           </h3>
//           <p className="text-gray-600">
//             {filter === 'all' 
//               ? "Start by creating your first election to engage your audience"
//               : `You don't have any ${filter} elections at the moment`
//             }
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredElections.map((election) => (
//             <div
//               key={election.id}
//               className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
//             >
//               {election.media_url ? (
//                 <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
//                   <img
//                     src={election.media_url}
//                     alt={election.title}
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute top-4 right-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
//                       {election.status}
//                     </span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
//                   <span className="text-6xl">🗳️</span>
//                   <div className="absolute top-4 right-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
//                       {election.status}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               <div className="p-6 space-y-4">
//                 <div>
//                   <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
//                     {election.title}
//                   </h3>
//                   <p className="text-sm text-gray-600 line-clamp-2">
//                     {election.description || 'No description provided'}
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="flex items-center gap-2">
//                     <Users className="text-purple-600" size={16} />
//                     <div>
//                       <p className="text-xs text-gray-600">Participants</p>
//                       <p className="font-semibold text-gray-900">{election.total_votes || 0}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Eye className="text-blue-600" size={16} />
//                     <div>
//                       <p className="text-xs text-gray-600">Views</p>
//                       <p className="font-semibold text-gray-900">{election.views || 0}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-green-50 rounded-lg p-3">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs text-gray-600">Participation Fee</span>
//                     <span className="font-semibold text-green-700">
//                       ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-gray-600">Total Revenue</span>
//                     <span className="text-lg font-bold text-green-600">
//                       ${calculateRevenue(election)}
//                     </span>
//                   </div>
//                 </div>

//                 {election.is_gamified && (
//                   <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-2">
//                     <Gift className="text-purple-600" size={20} />
//                     <div className="flex-1">
//                       <p className="text-xs text-gray-600">Prize Pool</p>
//                       <p className="font-semibold text-purple-700">
//                         ${parseFloat(election.total_prize_pool || 0).toFixed(2)}
//                       </p>
//                     </div>
//                     {election.has_lottery_ended ? (
//                       <CheckCircle className="text-green-600" size={20} />
//                     ) : (
//                       <Clock className="text-orange-600" size={20} />
//                     )}
//                   </div>
//                 )}

//                 <div className="border-t pt-3">
//                   <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
//                     <Calendar size={14} />
//                     <span>Start: {new Date(election.start_date).toLocaleDateString()}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Calendar size={14} />
//                     <span>End: {new Date(election.end_date).toLocaleDateString()}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 flex-wrap">
//                   <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
//                     {election.voting_type || 'plurality'}
//                   </span>
//                   {election.allow_vote_editing && (
//                     <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
//                       Editable
//                     </span>
//                   )}
//                   {election.is_biometric_required && (
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
//                       Biometric
//                     </span>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-2 gap-2 pt-2">
//                   <button
//                     onClick={() => navigate(`/election/${election.id}`)}
//                     className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
//                   >
//                     <Eye size={16} />
//                     View
//                   </button>
//                   <button
//                     onClick={() => navigate(`/dashboard?tab=all-elections&view=${election.id}`)}
//                     className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
//                   >
//                     <Edit size={16} />
//                     Manage
//                   </button>
//                   <button
//                     onClick={() => {
//                       const url = `${window.location.origin}/election/${election.id}`;
//                       navigator.clipboard.writeText(url);
//                       alert('Election link copied!');
//                     }}
//                     className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
//                   >
//                     <Share2 size={16} />
//                     Share
//                   </button>
//                   <button
//                     onClick={() => navigate('/dashboard?tab=creator-wallet')}
//                     className="flex items-center justify-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition text-sm"
//                   >
//                     <TrendingUp size={16} />
//                     Revenue
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }