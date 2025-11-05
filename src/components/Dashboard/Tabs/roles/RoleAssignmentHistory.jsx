import React, { useState } from 'react';
import { Search, History, Loader, Filter, Calendar, User, AlertCircle, Clock } from 'lucide-react';
import { useGetUserRoleHistoryQuery } from '../../../../redux/api/role/assignmentApi';
import { useAuth } from '../../../../redux/hooks';
import { formatDate, getRoleBadgeColor } from '../../../../utils/roleHelpers';

export default function RoleAssignmentHistory() {
  const auth = useAuth();
  
  // State
  const [searchUserId, setSearchUserId] = useState(auth.userId || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [limit, setLimit] = useState(50);
  
  // API hook
  const { data: historyData, isLoading, error, refetch } = useGetUserRoleHistoryQuery(
    {
      userId: searchUserId,
      is_active: filterStatus === 'all' ? undefined : filterStatus === 'active',
      limit: limit,
    },
    { skip: !searchUserId }
  );
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUserId) {
      refetch();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Role Assignment History</h2>
        <p className="text-gray-600 mt-1">View complete history of role assignments and changes</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User ID Search */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                placeholder="Enter User ID..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter by status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            
            {/* Limit */}
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>Last 10 records</option>
              <option value={25}>Last 25 records</option>
              <option value={50}>Last 50 records</option>
              <option value={100}>Last 100 records</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Search size={20} />
            <span>Search History</span>
          </button>
        </form>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error loading history</p>
            <p className="text-red-600 text-sm">{error.data?.message || 'Failed to load history'}</p>
          </div>
        </div>
      )}
      
      {/* History Timeline */}
      {historyData?.data && historyData.data.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History size={20} />
                History for User #{searchUserId}
              </h3>
              <span className="text-sm text-gray-600">
                {historyData.data.length} record(s) found
              </span>
            </div>
            
            <div className="space-y-4">
              {historyData.data.map((record, index) => {
                // ✅ Determine the action based on the data
                let actionType = 'assigned';
                let actionColor = 'green';
                let actionDate = record.assigned_at;
                let actionBy = record.assigned_by_email;
                
                if (record.deactivated_at) {
                  actionType = 'deactivated';
                  actionColor = 'red';
                  actionDate = record.deactivated_at;
                  /*eslint-disable*/
                  actionBy = record.deactivated_by_email;
                } else if (!record.is_active) {
                  actionType = 'inactive';
                  actionColor = 'gray';
                }
                
                return (
                  <div key={record.assignment_id || index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-0 last:pb-0">
                    {/* Timeline Dot */}
                    <div className={`absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                      actionColor === 'green' ? 'bg-green-500 border-green-600' :
                      actionColor === 'red' ? 'bg-red-500 border-red-600' :
                      actionColor === 'blue' ? 'bg-blue-500 border-blue-600' :
                      'bg-gray-400 border-gray-500'
                    }`} />
                    
                    {/* Content */}
                    <div className="bg-gray-50 rounded-lg p-4 ml-4">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Action Badge */}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            actionColor === 'green' ? 'bg-green-100 text-green-800' :
                            actionColor === 'red' ? 'bg-red-100 text-red-800' :
                            actionColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {actionType.toUpperCase()}
                          </span>
                          
                          {/* Role Badge */}
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(record.role_name)}`}>
                            {record.role_name}
                          </span>
                          
                          {/* Status Badge */}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            record.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.is_active ? 'Active' : 'Inactive'}
                          </span>
                          
                          {/* Assignment Type */}
                          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
                            {record.assignment_type}
                          </span>
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {formatDate(actionDate)}
                        </div>
                      </div>
                      
                      {/* Assignment Details */}
                      <div className="space-y-2 text-sm">
                        {/* Assigned Date */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={14} />
                          <span className="font-medium">Assigned:</span>
                          <span>{formatDate(record.assigned_at)}</span>
                          {record.assigned_by_email && (
                            <span className="text-gray-600">by {record.assigned_by_email}</span>
                          )}
                        </div>
                        
                        {/* Deactivated Date */}
                        {record.deactivated_at && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={14} />
                            <span className="font-medium">Deactivated:</span>
                            <span>{formatDate(record.deactivated_at)}</span>
                            {record.deactivated_by_email && (
                              <span className="text-gray-600">by {record.deactivated_by_email}</span>
                            )}
                          </div>
                        )}
                        
                        {/* Deactivation Reason */}
                        {record.deactivation_reason && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <span className="font-medium">Reason:</span>
                            <span className="text-red-600">{record.deactivation_reason}</span>
                          </div>
                        )}
                        
                        {/* Expiration */}
                        {record.expires_at && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <Calendar size={14} />
                            <span className="font-medium">Expires:</span>
                            <span>{formatDate(record.expires_at)}</span>
                          </div>
                        )}
                        
                        {/* Source */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Source:</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {record.assignment_source}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      {record.metadata && Object.keys(record.metadata).length > 0 && (
                        <details className="mt-3">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
                            View metadata
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                            {JSON.stringify(record.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : searchUserId && !isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <History className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No history found for User #{searchUserId}</p>
          <p className="text-gray-400 text-sm mt-2">This user has no role assignments yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Enter a User ID to view assignment history</p>
          <p className="text-gray-400 text-sm mt-2">Search above to see role assignment timeline</p>
        </div>
      )}
    </div>
  );
}

// import React, { useState } from 'react';
// //import { useGetUserRoleHistoryQuery } from '../../../redux/api/role/assignmentApi';
// //import { useAuth } from '../../../redux/hooks';
// //import { getRoleBadgeColor, formatDate } from '../../../utils/roleHelpers';
// import { Search, History, Loader, Filter, Calendar, User, AlertCircle } from 'lucide-react';
// import { useGetUserRoleHistoryQuery } from '../../../../redux/api/role/assignmentApi';
// import { useAuth } from '../../../../redux/hooks';
// import { formatDate, getRoleBadgeColor } from '../../../../utils/roleHelpers';

// export default function RoleAssignmentHistory() {
//   const auth = useAuth();
  
//   // State
//   const [searchUserId, setSearchUserId] = useState(auth.userId || '');
//   const [filterAction, setFilterAction] = useState('all');
//   const [limit, setLimit] = useState(50);
  
//   // API hook
//   const { data: historyData, isLoading, error, refetch } = useGetUserRoleHistoryQuery(
//     {
//       userId: searchUserId,
//       action: filterAction === 'all' ? undefined : filterAction,
//       limit: limit,
//     },
//     { skip: !searchUserId }
//   );
  
//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchUserId) {
//       refetch();
//     }
//   };
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }
  
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-3xl font-bold text-gray-900">Role Assignment History</h2>
//         <p className="text-gray-600 mt-1">View complete audit trail of role assignments and changes</p>
//       </div>
      
//       {/* Search and Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <form onSubmit={handleSearch} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* User ID Search */}
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="number"
//                 placeholder="Enter User ID..."
//                 value={searchUserId}
//                 onChange={(e) => setSearchUserId(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             {/* Filter by action */}
//             <select
//               value={filterAction}
//               onChange={(e) => setFilterAction(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="all">All Actions</option>
//               <option value="assigned">Assigned</option>
//               <option value="deactivated">Deactivated</option>
//               <option value="reactivated">Reactivated</option>
//               <option value="expired">Expired</option>
//             </select>
            
//             {/* Limit */}
//             <select
//               value={limit}
//               onChange={(e) => setLimit(parseInt(e.target.value))}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value={10}>Last 10 records</option>
//               <option value={25}>Last 25 records</option>
//               <option value={50}>Last 50 records</option>
//               <option value={100}>Last 100 records</option>
//             </select>
//           </div>
          
//           <button
//             type="submit"
//             className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
//           >
//             <Search size={20} />
//             <span>Search History</span>
//           </button>
//         </form>
//       </div>
      
//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
//           <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
//           <div>
//             <p className="text-red-800 font-medium">Error loading history</p>
//             <p className="text-red-600 text-sm">{error.data?.message || 'Failed to load history'}</p>
//           </div>
//         </div>
//       )}
      
//       {/* History Timeline */}
//       {historyData?.data && historyData.data.length > 0 ? (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//               <History size={20} />
//               History for User #{searchUserId}
//             </h3>
            
//             <div className="space-y-4">
                
//               {historyData.data.map((record) => (
//                 <div key={record.history_id} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-0">
//                   {/* Timeline Dot */}
//                   <div className={`absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
//                     record.action === 'assigned' ? 'bg-green-500 border-green-600' :
//                     record.action === 'deactivated' ? 'bg-red-500 border-red-600' :
//                     record.action === 'reactivated' ? 'bg-blue-500 border-blue-600' :
//                     'bg-yellow-500 border-yellow-600'
//                   }`} />
                  
//                   {/* Content */}
//                   <div className="bg-gray-50 rounded-lg p-4 ml-4">
//                     <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
//                       <div className="flex items-center gap-3 flex-wrap">
//                         <span className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           record.action === 'assigned' ? 'bg-green-100 text-green-800' :
//                           record.action === 'deactivated' ? 'bg-red-100 text-red-800' :
//                           record.action === 'reactivated' ? 'bg-blue-100 text-blue-800' :
//                           'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {record.action.toUpperCase()}
//                         </span>
                        
//                         <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(record.role_name)}`}>
//                           {record.role_name}
//                         </span>
                        
//                         <span className={`px-3 py-1 text-xs font-medium rounded-full ${
//                           record.new_status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {record.new_status ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
                      
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <Calendar size={14} />
//                         {formatDate(record.action_at)}
//                       </div>
//                     </div>
                    
//                     {record.action_reason && (
//                       <p className="text-sm text-gray-700 mb-2">
//                         <span className="font-medium">Reason:</span> {record.action_reason}
//                       </p>
//                     )}
                    
//                     {record.action_by_email && (
//                       <p className="text-xs text-gray-600">
//                         <span className="font-medium">Action by:</span> {record.action_by_email}
//                       </p>
//                     )}
                    
//                     {record.metadata && Object.keys(record.metadata).length > 0 && (
//                       <details className="mt-3">
//                         <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
//                           View metadata
//                         </summary>
//                         <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
//                           {JSON.stringify(record.metadata, null, 2)}
//                         </pre>
//                       </details>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       ) : searchUserId && !isLoading ? (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <History className="mx-auto text-gray-400 mb-4" size={48} />
//           <p className="text-gray-500">No history found for this user</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <User className="mx-auto text-gray-400 mb-4" size={48} />
//           <p className="text-gray-500">Enter a User ID to view assignment history</p>
//         </div>
//       )}
//     </div>
//   );
// }