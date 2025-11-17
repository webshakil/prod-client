// src/components/Dashboard/Tabs/voting/LiveResultsChart.jsx
// ✅ Real-time Results with Socket.IO - PDF #10 Format - FIXED
import React, { useState, useEffect } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, Users } from 'lucide-react';
import { useGetLiveResultsQuery } from '../../../../redux/api/voting/ballotApi';
import LivePieChart from './LivePieChart';
import io from 'socket.io-client';

// ✅ Socket.IO connection
const SOCKET_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007';

export default function LiveResultsChart({ 
  electionId,
  liveResultsVisible = false,
  votingType = 'plurality',
}) {
  const [liveData, setLiveData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initial fetch
  const { 
    data: initialData, 
    isLoading, 
    error,
    refetch 
  } = useGetLiveResultsQuery(electionId, {
    skip: !electionId || !liveResultsVisible,
  });

  // ✅ FIXED: Set initial data - Handle nested structure
  useEffect(() => {
    if (initialData) {
      console.log('📊 Initial live results loaded:', initialData);
      // ⭐ Extract data from nested response
      const data = initialData?.data || initialData;
      setLiveData(data);
    }
  }, [initialData]);

  // ✅ Socket.IO Real-time Updates
  useEffect(() => {
    if (!electionId || !liveResultsVisible) return;

    console.log('🔌 Connecting to Socket.IO for election:', electionId);

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      setIsConnected(true);
      
      // Join election room
      newSocket.emit('join-election', electionId);
      console.log('📡 Joined election room:', electionId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    // ✅ Listen for vote cast events
    newSocket.on('vote-cast', (data) => {
      console.log('🗳️ Vote cast event received:', data);
      // Refetch live results
      refetch();
    });

    // ✅ FIXED: Listen for live results updates - Store raw data
    newSocket.on('live-results-update', (updatedResults) => {
      console.log('📊 Live results update received:', updatedResults);
      // ⭐ Socket sends raw data structure directly
      setLiveData(updatedResults);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting socket...');
      if (newSocket) {
        newSocket.emit('leave-election', electionId);
        newSocket.disconnect();
      }
    };
  }, [electionId, liveResultsVisible, refetch]);

  if (!liveResultsVisible) {
    return (
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <EyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold mb-2">Live Results Hidden</p>
        <p className="text-gray-500 text-sm">
          Results will be visible after the election ends
        </p>
      </div>
    );
  }

  if (isLoading && !liveData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading live results...</p>
      </div>
    );
  }

  if (error && !liveData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Failed to load results</p>
        <p className="text-red-600 text-sm">{error.data?.error || 'Unknown error'}</p>
      </div>
    );
  }

  // ⭐ FIXED: Extract data properly from both sources
  const resultsData = liveData || (initialData?.data || initialData);
  const totalVotes = resultsData?.totalVotes || 0;
  const questions = resultsData?.questions || [];

  console.log('🔍 LiveResultsChart Data:', {
    hasLiveData: !!liveData,
    hasInitialData: !!initialData,
    totalVotes,
    questionsCount: questions.length,
  });

  // Get first question for pie chart (PDF #10 shows single question)
  const firstQuestion = questions[0];
  const candidates = firstQuestion?.options || [];

  return (
    <div className="space-y-6">
      {/* ✅ PDF #10 Format - Side-by-side layout */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Live Results</h2>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                {isConnected && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* ✅ PDF #10 Layout - Pie Chart on the Right */}
        {firstQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Question Info */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {firstQuestion.question_text}
                </h3>
                <p className="text-gray-600 text-sm">
                  Voting Type: <span className="font-semibold capitalize">{votingType.replace('_', ' ')}</span>
                </p>
              </div>

              {/* Detailed Results - PDF #10 Style */}
              <div className="space-y-3">
                {candidates.map((option, index) => {
                  const questionTotalVotes = candidates.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
                  const percentage = questionTotalVotes > 0 
                    ? ((option.vote_count / questionTotalVotes) * 100).toFixed(1) 
                    : '0.0';
                  const isLeading = option.vote_count === Math.max(...candidates.map(o => o.vote_count || 0));

                  // PDF #10 Colors
                  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={option.id} className="relative">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative overflow-hidden">
                        {/* Progress bar background */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="absolute inset-y-0 left-0 rounded-lg opacity-20"
                          style={{ backgroundColor: color }}
                        />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-semibold text-gray-800">
                              {String.fromCharCode(65 + index)} - {option.option_text}
                            </span>
                            {isLeading && option.vote_count > 0 && (
                              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                🏆 Leading
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {percentage}%
                            </p>
                            <p className="text-sm text-gray-600">
                              {option.vote_count || 0} vote{option.vote_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Pie Chart - PDF #10 Format */}
            <div className="flex items-start justify-center">
              <div className="w-full max-w-md" style={{ height: '400px' }}>
                <LivePieChart
                  candidates={candidates}
                  liveResults={resultsData}
                  votingType={votingType}
                />
              </div>
            </div>
          </div>
        )}

        {/* No results yet */}
        {!firstQuestion && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg font-semibold">No votes yet</p>
            <p className="text-gray-400 text-sm mt-2">Results will appear as votes are cast</p>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && liveResultsVisible && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm">
            ⚠️ Real-time updates disconnected. Click refresh to update manually.
          </p>
        </div>
      )}
    </div>
  );
}
// // src/components/Dashboard/Tabs/voting/LiveResultsChart.jsx
// // ✅ Real-time Results with Socket.IO - PDF #10 Format
// import React, { useState, useEffect } from 'react';
// /*eslint-disable*/
// import { motion } from 'framer-motion';
// import { Eye, EyeOff, RefreshCw, Users } from 'lucide-react';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/ballotApi';
// import LivePieChart from './LivePieChart';
// import io from 'socket.io-client';

// // ✅ Socket.IO connection
// const SOCKET_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007';

// export default function LiveResultsChart({ 
//   electionId,
//   liveResultsVisible = false,
//   votingType = 'plurality',
// }) {
//   const [liveData, setLiveData] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // Initial fetch
//   const { 
//     data: initialData, 
//     isLoading, 
//     error,
//     refetch 
//   } = useGetLiveResultsQuery(electionId, {
//     skip: !electionId || !liveResultsVisible,
//   });

//   // ✅ Set initial data
//   useEffect(() => {
//     if (initialData) {
//       console.log('📊 Initial live results loaded:', initialData);
//       setLiveData(initialData);
//     }
//   }, [initialData]);

//   // ✅ Socket.IO Real-time Updates
//   useEffect(() => {
//     if (!electionId || !liveResultsVisible) return;

//     console.log('🔌 Connecting to Socket.IO for election:', electionId);

//     // Create socket connection
//     const newSocket = io(SOCKET_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     newSocket.on('connect', () => {
//       console.log('✅ Socket.IO connected');
//       setIsConnected(true);
      
//       // Join election room
//       newSocket.emit('join-election', electionId);
//       console.log('📡 Joined election room:', electionId);
//     });

//     newSocket.on('disconnect', () => {
//       console.log('❌ Socket.IO disconnected');
//       setIsConnected(false);
//     });

//     // ✅ Listen for vote cast events
//     newSocket.on('vote-cast', (data) => {
//       console.log('🗳️ Vote cast event received:', data);
//       // Refetch live results
//       refetch();
//     });

//     // ✅ Listen for live results updates
//     newSocket.on('live-results-update', (updatedResults) => {
//       console.log('📊 Live results update received:', updatedResults);
//       setLiveData(updatedResults);
//     });

//     setSocket(newSocket);

//     // Cleanup
//     return () => {
//       console.log('🔌 Disconnecting socket...');
//       if (newSocket) {
//         newSocket.emit('leave-election', electionId);
//         newSocket.disconnect();
//       }
//     };
//   }, [electionId, liveResultsVisible, refetch]);

//   if (!liveResultsVisible) {
//     return (
//       <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
//         <EyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//         <p className="text-gray-600 font-semibold mb-2">Live Results Hidden</p>
//         <p className="text-gray-500 text-sm">
//           Results will be visible after the election ends
//         </p>
//       </div>
//     );
//   }

//   if (isLoading && !liveData) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
//         <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
//         <p className="text-gray-600 font-semibold">Loading live results...</p>
//       </div>
//     );
//   }

//   if (error && !liveData) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
//         <p className="text-red-800 font-semibold mb-2">Failed to load results</p>
//         <p className="text-red-600 text-sm">{error.data?.error || 'Unknown error'}</p>
//       </div>
//     );
//   }

//   const resultsData = liveData || initialData;
//   const totalVotes = resultsData?.totalVotes || 0;
//   const questions = resultsData?.questions || [];

//   // Get first question for pie chart (PDF #10 shows single question)
//   const firstQuestion = questions[0];
//   const candidates = firstQuestion?.options || [];

//   return (
//     <div className="space-y-6">
//       {/* ✅ PDF #10 Format - Side-by-side layout */}
//       <div className="bg-white rounded-2xl shadow-lg p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <Eye className="w-8 h-8 text-blue-600" />
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Live Results</h2>
//               <p className="text-gray-600 text-sm flex items-center gap-2">
//                 <Users className="w-4 h-4" />
//                 {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
//                 {isConnected && (
//                   <>
//                     <span className="mx-2">•</span>
//                     <span className="flex items-center gap-1">
//                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                       Live
//                     </span>
//                   </>
//                 )}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() => refetch()}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             <RefreshCw className="w-5 h-5" />
//             Refresh
//           </button>
//         </div>

//         {/* ✅ PDF #10 Layout - Pie Chart on the Right */}
//         {firstQuestion && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Left: Question Info */}
//             <div>
//               <div className="mb-6">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4">
//                   {firstQuestion.question_text}
//                 </h3>
//                 <p className="text-gray-600 text-sm">
//                   Voting Type: <span className="font-semibold capitalize">{votingType.replace('_', ' ')}</span>
//                 </p>
//               </div>

//               {/* Detailed Results - PDF #10 Style */}
//               <div className="space-y-3">
//                 {candidates.map((option, index) => {
//                   const questionTotalVotes = candidates.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
//                   const percentage = questionTotalVotes > 0 
//                     ? ((option.vote_count / questionTotalVotes) * 100).toFixed(1) 
//                     : '0.0';
//                   const isLeading = option.vote_count === Math.max(...candidates.map(o => o.vote_count || 0));

//                   // PDF #10 Colors
//                   const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
//                   const color = COLORS[index % COLORS.length];

//                   return (
//                     <div key={option.id} className="relative">
//                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative overflow-hidden">
//                         {/* Progress bar background */}
//                         <motion.div
//                           initial={{ width: 0 }}
//                           animate={{ width: `${percentage}%` }}
//                           transition={{ duration: 0.8, delay: index * 0.1 }}
//                           className="absolute inset-y-0 left-0 rounded-lg opacity-20"
//                           style={{ backgroundColor: color }}
//                         />

//                         <div className="relative flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <div 
//                               className="w-6 h-6 rounded-full flex-shrink-0"
//                               style={{ backgroundColor: color }}
//                             />
//                             <span className="font-semibold text-gray-800">
//                               {String.fromCharCode(65 + index)} - {option.option_text}
//                             </span>
//                             {isLeading && option.vote_count > 0 && (
//                               <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
//                                 🏆 Leading
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-right">
//                             <p className="font-bold text-gray-900">
//                               {percentage}%
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               {option.vote_count || 0} vote{option.vote_count !== 1 ? 's' : ''}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Right: Pie Chart - PDF #10 Format */}
//             <div className="flex items-start justify-center">
//               <div className="w-full max-w-md" style={{ height: '400px' }}>
//                 <LivePieChart
//                   candidates={candidates}
//                   liveResults={resultsData}
//                   votingType={votingType}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* No results yet */}
//         {!firstQuestion && (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg font-semibold">No votes yet</p>
//             <p className="text-gray-400 text-sm mt-2">Results will appear as votes are cast</p>
//           </div>
//         )}
//       </div>

//       {/* Connection Status */}
//       {!isConnected && liveResultsVisible && (
//         <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
//           <p className="text-yellow-800 text-sm">
//             ⚠️ Real-time updates disconnected. Click refresh to update manually.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }