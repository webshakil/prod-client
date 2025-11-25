import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEdit, FaTrash, FaCopy, FaDownload, FaSearch, FaBan } from 'react-icons/fa';
import { getMyElections, cloneElection, exportElection } from '../../../redux/api/election/electionApi';

export default function AllElections() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchElections();
  }, [page]);
  
  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await getMyElections(page, 10);
      
      if (response.success) {
        setElections(response.data.elections || []);
        setTotalPages(Math.ceil((response.data.total || 0) / 10));
      }
    } catch (error) {
      console.error('Fetch elections error:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ Edit/Delete disabled in All Elections - show message
  const handleEditDisabled = () => {
    toast.info('Go to "My Elections" to edit your elections');
  };

  const handleDeleteDisabled = () => {
    toast.info('Go to "My Elections" to delete your elections');
  };
  
  const handleClone = async (electionId, title) => {
    const newTitle = prompt(`Clone election as:`, `${title} (Copy)`);
    if (!newTitle) return;
    
    try {
      const response = await cloneElection(electionId, newTitle);
      if (response.success) {
        toast.success('Election cloned successfully');
        fetchElections();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clone election');
    }
  };
  
  const handleExport = async (electionId, title) => {
    try {
      const response = await exportElection(electionId, 'json');
      
      // Download JSON
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Election exported successfully');
      /*eslint-disable*/
    } catch (error) {
      toast.error('Failed to export election');
    }
  };
  
  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || election.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Elections</h1>
        <p className="text-gray-600">Manage all your elections</p>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {/* Elections List */}
      {filteredElections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Elections Found</h3>
          <p className="text-gray-600">Create your first election to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredElections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              onView={() => navigate(`/election/${election.id}`, { 
                state: { source: 'all-elections' }  // ✅ Pass source
              })}
              onEdit={handleEditDisabled}           // ✅ Disabled
              onDelete={handleDeleteDisabled}       // ✅ Disabled
              onClone={() => handleClone(election.id, election.title)}
              onExport={() => handleExport(election.id, election.title)}
              isEditDeleteDisabled={true}           // ✅ Pass flag
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ElectionCard({ election, onView, onEdit, onDelete, onClone, onExport, isEditDeleteDisabled }) {
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{election.title}</h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{election.description}</p>
          
          <div className="flex flex-wrap gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor(election.status)}`}>
              {election.status}
            </span>
            <span className="text-gray-600">
              📅 {new Date(election.start_date).toLocaleDateString()}
            </span>
            <span className="text-gray-600">
              🗳️ {election.voting_type}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={onView}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View"
          >
            <FaEye />
          </button>
          
          {/* ✅ Edit Button - Disabled with gray color */}
          <button
            onClick={onEdit}
            className={`p-2 rounded-lg transition ${
              isEditDeleteDisabled 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={isEditDeleteDisabled ? 'Go to My Elections to edit' : 'Edit'}
          >
            {isEditDeleteDisabled ? <FaBan /> : <FaEdit />}
          </button>
          
          <button
            onClick={onClone}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
            title="Clone"
          >
            <FaCopy />
          </button>
          <button
            onClick={onExport}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Export"
          >
            <FaDownload />
          </button>
          
          {/* ✅ Delete Button - Disabled with gray color */}
          <button
            onClick={onDelete}
            className={`p-2 rounded-lg transition ${
              isEditDeleteDisabled 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-red-600 hover:bg-red-50'
            }`}
            title={isEditDeleteDisabled ? 'Go to My Elections to delete' : 'Delete'}
          >
            {isEditDeleteDisabled ? <FaBan /> : <FaTrash />}
          </button>
        </div>
      </div>
    </div>
  );
}
//last working code
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FaEye, FaEdit, FaTrash, FaCopy, FaDownload, FaSearch } from 'react-icons/fa';
// import { getMyElections, deleteElection, cloneElection, exportElection } from '../../../redux/api/election/electionApi';

// export default function AllElections() {
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
  
//   useEffect(() => {
//     fetchElections();
//   }, [page]);
  
//   const fetchElections = async () => {
//     try {
//       setLoading(true);
//       const response = await getMyElections(page, 10);
      
//       if (response.success) {
//         setElections(response.data.elections || []);
//         setTotalPages(Math.ceil((response.data.total || 0) / 10));
//       }
//     } catch (error) {
//       console.error('Fetch elections error:', error);
//       toast.error('Failed to load elections');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleDelete = async (electionId, title) => {
//     if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
//       return;
//     }
    
//     try {
//       const response = await deleteElection(electionId);
//       if (response.success) {
//         toast.success('Election deleted successfully');
//         fetchElections();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to delete election');
//     }
//   };
  
//   const handleClone = async (electionId, title) => {
//     const newTitle = prompt(`Clone election as:`, `${title} (Copy)`);
//     if (!newTitle) return;
    
//     try {
//       const response = await cloneElection(electionId, newTitle);
//       if (response.success) {
//         toast.success('Election cloned successfully');
//         fetchElections();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to clone election');
//     }
//   };
  
//   const handleExport = async (electionId, title) => {
//     try {
//       const response = await exportElection(electionId, 'json');
      
//       // Download JSON
//       const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
//       a.click();
//       URL.revokeObjectURL(url);
      
//       toast.success('Election exported successfully');
//       /*eslint-disable*/
//     } catch (error) {
//       toast.error('Failed to export election');
//     }
//   };
  
//   const filteredElections = elections.filter(election => {
//     const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = filterStatus === 'all' || election.status === filterStatus;
//     return matchesSearch && matchesStatus;
//   });
  
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading elections...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">All Elections</h1>
//         <p className="text-gray-600">Manage all your elections</p>
//       </div>
      
//       {/* Filters */}
//       <div className="mb-6 flex flex-col md:flex-row gap-4">
//         <div className="flex-1 relative">
//           <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search elections..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <select
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="all">All Status</option>
//           <option value="draft">Draft</option>
//           <option value="published">Published</option>
//           <option value="active">Active</option>
//           <option value="completed">Completed</option>
//         </select>
//       </div>
      
//       {/* Elections List */}
//       {filteredElections.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <div className="text-6xl mb-4">📋</div>
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">No Elections Found</h3>
//           <p className="text-gray-600">Create your first election to get started</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {filteredElections.map((election) => (
//             <ElectionCard
//               key={election.id}
//               election={election}
//               onView={() => navigate(`/dashboard/election/${election.id}`)}
//               onEdit={() => navigate(`/dashboard/election/${election.id}/edit`)}
//               onDelete={() => handleDelete(election.id, election.title)}
//               onClone={() => handleClone(election.id, election.title)}
//               onExport={() => handleExport(election.id, election.title)}
//             />
//           ))}
//         </div>
//       )}
      
//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="mt-6 flex justify-center gap-2">
//           <button
//             onClick={() => setPage(Math.max(1, page - 1))}
//             disabled={page === 1}
//             className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             onClick={() => setPage(Math.min(totalPages, page + 1))}
//             disabled={page === totalPages}
//             className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function ElectionCard({ election, onView, onEdit, onDelete, onClone, onExport }) {
//   const getStatusColor = (status) => {
//     const colors = {
//       'draft': 'bg-gray-100 text-gray-800',
//       'published': 'bg-blue-100 text-blue-800',
//       'active': 'bg-green-100 text-green-800',
//       'completed': 'bg-purple-100 text-purple-800'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };
  
//   return (
//     <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <h3 className="text-xl font-bold text-gray-900 mb-2">{election.title}</h3>
//           <p className="text-gray-600 mb-3 line-clamp-2">{election.description}</p>
          
//           <div className="flex flex-wrap gap-3 text-sm">
//             <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor(election.status)}`}>
//               {election.status}
//             </span>
//             <span className="text-gray-600">
//               📅 {new Date(election.start_date).toLocaleDateString()}
//             </span>
//             <span className="text-gray-600">
//               🗳️ {election.voting_type}
//             </span>
//           </div>
//         </div>
        
//         <div className="flex gap-2 ml-4">
//           <button
//             onClick={onView}
//             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//             title="View"
//           >
//             <FaEye />
//           </button>
//           <button
//             onClick={onEdit}
//             className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
//             title="Edit"
//           >
//             <FaEdit />
//           </button>
//           <button
//             onClick={onClone}
//             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//             title="Clone"
//           >
//             <FaCopy />
//           </button>
//           <button
//             onClick={onExport}
//             className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
//             title="Export"
//           >
//             <FaDownload />
//           </button>
//           <button
//             onClick={onDelete}
//             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//             title="Delete"
//           >
//             <FaTrash />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }