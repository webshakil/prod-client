// src/pages/admin/VoteAuditPage.jsx - CORRECTED VERSION
import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, CheckCircle, Clock, User, Globe, Loader, Filter } from 'lucide-react';
import { useGetVoteAuditLogsQuery } from '../../redux/api/voting/votingApi';

export default function VoteAuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  /*eslint-disable*/
  const [selectedElection, setSelectedElection] = useState(''); // Empty = all elections
  const [page, setPage] = useState(1);
  const limit = 50;

  // ✅ Fetch real audit logs from backend
  const { 
    data: auditData, 
    isLoading, 
    error 
  } = useGetVoteAuditLogsQuery(
    { 
      electionId: selectedElection || 'all', 
      page, 
      limit 
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // ✅ Process and filter audit logs
  const auditLogs = useMemo(() => {
    const logs = auditData?.data || [];
    
    // Filter by search term
    let filtered = logs.filter(log => 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toString().includes(searchTerm) ||
      log.election_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm)
    );

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'flagged') {
        filtered = filtered.filter(log => log.flagged_for_review);
      } else {
        filtered = filtered.filter(log => log.attempt_type === filterType);
      }
    }

    return filtered;
  }, [auditData, searchTerm, filterType]);

  // ✅ Calculate stats from real data
  const stats = useMemo(() => {
    const allLogs = auditData?.data || [];
    return {
      flagged: allLogs.filter(log => log.flagged_for_review).length,
      total: allLogs.length,
      reviewed: allLogs.filter(log => log.reviewed_at).length,
    };
  }, [auditData]);

  // ✅ Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // ✅ Get attempt type color
  const getAttemptTypeColor = (type) => {
    const colors = {
      duplicate_vote: 'bg-red-100 text-red-800',
      vote_after_close: 'bg-orange-100 text-orange-800',
      vote_before_start: 'bg-yellow-100 text-yellow-800',
      unauthorized_access: 'bg-purple-100 text-purple-800',
      suspicious_activity: 'bg-pink-100 text-pink-800',
      video_skip: 'bg-blue-100 text-blue-800',
      ip_mismatch: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // ✅ Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Vote Audit Trails
          </h1>
          <p className="text-gray-600 mt-2">Monitor suspicious voting attempts and security events</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 font-semibold mb-2">Error Loading Audit Logs</p>
          <p className="text-sm text-red-600">
            {error?.data?.message || error?.message || 'Failed to load audit logs. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Vote Audit Trails
          </h1>
          <p className="text-gray-600 mt-2">Monitor suspicious voting attempts and security events</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Vote Audit Trails
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor suspicious voting attempts and security events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Flagged Attempts</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.flagged}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Attempts</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Reviewed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.reviewed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="inline w-4 h-4 mr-1" />
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="flagged">Flagged Only</option>
              <option value="duplicate_vote">Duplicate Vote</option>
              <option value="vote_after_close">Vote After Close</option>
              <option value="vote_before_start">Vote Before Start</option>
              <option value="unauthorized_access">Unauthorized Access</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="video_skip">Video Skip</option>
              <option value="ip_mismatch">IP Mismatch</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="inline w-4 h-4 mr-1" />
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, user ID, election, or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <User className="inline w-4 h-4 mr-1" />
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Election
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <Globe className="inline w-4 h-4 mr-1" />
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No Suspicious Activity Found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm || filterType !== 'all'
                        ? 'Try adjusting your filters'
                        : 'All voting attempts appear normal'}
                    </p>
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.attempted_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.user_name || `${log.first_name || ''} ${log.last_name || ''}`.trim() || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">ID: {log.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.election_title || 'Unknown Election'}</div>
                      <div className="text-xs text-gray-500">ID: {log.election_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAttemptTypeColor(log.attempt_type)}`}>
                        {log.attempt_type?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-mono">{log.ip_address || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {log.flagged_for_review && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Flagged
                          </span>
                        )}
                        {log.reviewed_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {auditData?.pagination && auditData.pagination.total > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, auditData.pagination.total)} of {auditData.pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
              Page {page} of {auditData.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= auditData.pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-semibold">Real-Time Monitoring Active</p>
            <p className="text-sm text-blue-700 mt-1">
              All voting attempts are logged and monitored. Suspicious activities are automatically flagged for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// // src/pages/admin/VoteAuditPage.jsx - CONNECTED TO BACKEND
// import React, { useState, useMemo } from 'react';
// import { Search, AlertTriangle, CheckCircle, Clock, User, Globe, Loader, Filter } from 'lucide-react';
// import { useGetVoteAuditLogsQuery } from '../../redux/api/voting/votingApi';

// export default function VoteAuditPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   /*eslint-disable*/
//   const [selectedElection, setSelectedElection] = useState(''); // Empty = all elections
//   const [page, setPage] = useState(1);
//   const limit = 50;

//   // ✅ Fetch real audit logs from backend
//   const { 
//     data: auditData, 
//     isLoading, 
//     error 
//   } = useGetVoteAuditLogsQuery(
//     { 
//       electionId: selectedElection || 'all', 
//       page, 
//       limit 
//     },
//     {
//       refetchOnMountOrArgChange: true,
//     }
//   );

//   // ✅ Process and filter audit logs
//   const auditLogs = useMemo(() => {
//     const logs = auditData?.data || [];
    
//     // Filter by search term
//     let filtered = logs.filter(log => 
//       log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       log.user_id?.toString().includes(searchTerm) ||
//       log.election_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       log.ip_address?.includes(searchTerm)
//     );

//     // Filter by type
//     if (filterType !== 'all') {
//       if (filterType === 'flagged') {
//         filtered = filtered.filter(log => log.flagged_for_review);
//       } else {
//         filtered = filtered.filter(log => log.attempt_type === filterType);
//       }
//     }

//     return filtered;
//   }, [auditData, searchTerm, filterType]);

//   // ✅ Calculate stats from real data
//   const stats = useMemo(() => {
//     const allLogs = auditData?.data || [];
//     return {
//       flagged: allLogs.filter(log => log.flagged_for_review).length,
//       total: allLogs.length,
//       reviewed: allLogs.filter(log => log.reviewed_at).length,
//     };
//   }, [auditData]);

//   // ✅ Format timestamp
//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // ✅ Get attempt type color
//   const getAttemptTypeColor = (type) => {
//     const colors = {
//       duplicate_vote: 'bg-red-100 text-red-800',
//       vote_after_close: 'bg-orange-100 text-orange-800',
//       unauthorized_access: 'bg-yellow-100 text-yellow-800',
//       suspicious_activity: 'bg-purple-100 text-purple-800',
//     };
//     return colors[type] || 'bg-gray-100 text-gray-800';
//   };

//   // ✅ Handle error state
//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <AlertTriangle className="w-8 h-8 text-red-600" />
//             Vote Audit Trails
//           </h1>
//           <p className="text-gray-600 mt-2">Monitor suspicious voting attempts and security events</p>
//         </div>
        
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//           <p className="text-red-800 font-semibold mb-2">Error Loading Audit Logs</p>
//           <p className="text-sm text-red-600">
//             {error?.data?.message || 'Failed to load audit logs. Please try again.'}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Handle loading state
//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <AlertTriangle className="w-8 h-8 text-red-600" />
//             Vote Audit Trails
//           </h1>
//           <p className="text-gray-600 mt-2">Monitor suspicious voting attempts and security events</p>
//         </div>
        
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//             <p className="text-gray-600">Loading audit logs...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <AlertTriangle className="w-8 h-8 text-red-600" />
//           Vote Audit Trails
//         </h1>
//         <p className="text-gray-600 mt-2">
//           Monitor suspicious voting attempts and security events
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Flagged Attempts</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">{stats.flagged}</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Attempts</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Reviewed</p>
//               <p className="text-3xl font-bold text-green-600 mt-1">{stats.reviewed}</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               <Filter className="inline w-4 h-4 mr-1" />
//               Filter by Type
//             </label>
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//             >
//               <option value="all">All Types</option>
//               <option value="flagged">Flagged Only</option>
//               <option value="duplicate_vote">Duplicate Vote</option>
//               <option value="vote_after_close">Vote After Close</option>
//               <option value="unauthorized_access">Unauthorized Access</option>
//               <option value="suspicious_activity">Suspicious Activity</option>
//             </select>
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               <Search className="inline w-4 h-4 mr-1" />
//               Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by email, user ID, election, or IP address..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Audit Logs Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Clock className="inline w-4 h-4 mr-1" />
//                   Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <User className="inline w-4 h-4 mr-1" />
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Election
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Globe className="inline w-4 h-4 mr-1" />
//                   IP Address
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {auditLogs.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center">
//                     <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
//                     <p className="text-gray-600 font-medium">No Suspicious Activity Found</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {searchTerm || filterType !== 'all'
//                         ? 'Try adjusting your filters'
//                         : 'All voting attempts appear normal'}
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 auditLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {formatTimestamp(log.attempted_at)}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <User className="w-4 h-4 text-gray-400" />
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {log.user_email || 'Anonymous'}
//                           </div>
//                           <div className="text-xs text-gray-500">ID: {log.user_id}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">{log.election_title}</div>
//                       <div className="text-xs text-gray-500">ID: {log.election_id}</div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAttemptTypeColor(log.attempt_type)}`}>
//                         {log.attempt_type?.replace(/_/g, ' ').toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       <div className="flex items-center gap-2">
//                         <Globe className="w-4 h-4" />
//                         <span className="font-mono">{log.ip_address}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       {log.flagged_for_review && (
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                           <AlertTriangle className="w-3 h-3 mr-1" />
//                           Flagged
//                         </span>
//                       )}
//                       {log.reviewed_at && (
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                           <CheckCircle className="w-3 h-3 mr-1" />
//                           Reviewed
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {auditData?.pagination && (
//         <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
//           <div className="text-sm text-gray-600">
//             Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, auditData.pagination.total)} of {auditData.pagination.total} results
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage(p => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setPage(p => p + 1)}
//               disabled={page >= Math.ceil(auditData.pagination.total / limit)}
//               className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 font-semibold">Real-Time Monitoring Active</p>
//             <p className="text-sm text-blue-700 mt-1">
//               All voting attempts are logged and monitored in real-time. Suspicious activities are automatically flagged for review.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/pages/admin/VoteAuditPage.jsx
// import React, { useState } from 'react';
// import { Search, AlertTriangle, CheckCircle, Clock, User, Globe } from 'lucide-react';

// export default function VoteAuditPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');

//   // Placeholder data
//   const auditLogs = [
//     {
//       id: 1,
//       user_email: 'user@example.com',
//       user_id: '123',
//       election_title: 'Sample Election',
//       election_id: 41,
//       attempt_type: 'duplicate_vote',
//       ip_address: '192.168.1.1',
//       attempted_at: new Date().toISOString(),
//       flagged_for_review: true,
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <AlertTriangle className="w-8 h-8 text-red-600" />
//           Vote Audit Trails
//         </h1>
//         <p className="text-gray-600 mt-2">
//           Monitor suspicious voting attempts and security events
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Flagged Attempts</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">12</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Attempts</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">45</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Reviewed</p>
//               <p className="text-3xl font-bold text-green-600 mt-1">33</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Filter by Type
//             </label>
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="all">All Types</option>
//               <option value="flagged">Flagged Only</option>
//               <option value="duplicate_vote">Duplicate Vote</option>
//               <option value="vote_after_close">Vote After Close</option>
//             </select>
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by email, user ID, or election..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Audit Logs Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {auditLogs.map((log) => (
//                 <tr key={log.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {new Date(log.attempted_at).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <User className="w-4 h-4 text-gray-400" />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{log.user_email}</div>
//                         <div className="text-xs text-gray-500">ID: {log.user_id}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-sm">{log.election_title}</td>
//                   <td className="px-6 py-4">
//                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                       {log.attempt_type.replace('_', ' ').toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     <div className="flex items-center gap-2">
//                       <Globe className="w-4 h-4" />
//                       {log.ip_address}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     {log.flagged_for_review && (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         <AlertTriangle className="w-3 h-3 mr-1" />
//                         Flagged
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Placeholder Notice */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <p className="text-sm text-blue-800">
//           🚧 <strong>Coming Soon:</strong> Real-time audit log integration with backend API
//         </p>
//       </div>
//     </div>
//   );
// }