// src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// ✅ FINAL FIXED VERSION
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetLiveResultsQuery } from '../../../../redux/api/voting/ballotApi';
import io from 'socket.io-client';
import { RefreshCw } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_VOTING_SERVICE_URL?.replace('/api', '') || 'http://localhost:3007';
/*eslint-disable*/
export default function CompactLiveResults({ electionId, questionId }) {
  const [liveData, setLiveData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const PDF_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  const { data: initialData, isLoading, refetch } = useGetLiveResultsQuery(electionId);

  useEffect(() => {
    if (initialData) {
      console.log('📊 Compact chart - RAW API response:', initialData);
      setLiveData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!electionId) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Compact chart - Socket connected');
      setIsConnected(true);
      newSocket.emit('join-election', electionId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Compact chart - Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('vote-cast', () => {
      console.log('🗳️ Compact chart - Vote detected, refreshing...');
      refetch();
    });

    newSocket.on('live-results-update', (updatedResults) => {
      console.log('📊 Compact chart - Live update received:', updatedResults);
      setLiveData({ success: true, data: updatedResults });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave-election', electionId);
        newSocket.disconnect();
      }
    };
  }, [electionId, refetch]);

  // ⭐ CRITICAL FIX: Extract data properly
  const rawData = liveData || initialData;
  const resultsData = rawData?.data || rawData;
  
  const apiTotalVotes = resultsData?.totalVotes || 0;
  const question = resultsData?.questions?.[0];
  const options = question?.options || [];
  const questionTotalVotes = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

  console.log('🔍 CompactLiveResults Data Structure:', {
    hasRawData: !!rawData,
    hasResultsData: !!resultsData,
    apiTotalVotes,
    questionTotalVotes,
    optionsCount: options.length,
    firstOption: options[0],
  });

  const chartData = options.map((option, index) => ({
    name: option.option_text,
    value: option.vote_count || 0,
    percentage: parseFloat(option.percentage || 0),
    color: PDF_COLORS[index % PDF_COLORS.length],
    letter: String.fromCharCode(65 + index),
  }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold"
        style={{ fontSize: '14px' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border-2 border-gray-200">
          <p className="font-bold text-gray-900 text-sm">{data.name}</p>
          <p className="text-xs text-gray-600">
            {data.value} vote{data.value !== 1 ? 's' : ''} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading && !liveData) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-3 border-gray-400 shadow-lg overflow-hidden">
      <div className="bg-gray-100 border-b-2 border-gray-400 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Live Results
            </h3>
            {/* ⭐ USE apiTotalVotes FROM API */}
            <p className="text-sm text-gray-600 mt-0.5">
              {apiTotalVotes} vote{apiTotalVotes !== 1 ? 's' : ''} cast
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-blue-600 hover:text-blue-700 transition p-1"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {questionTotalVotes > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                innerRadius={48}
                fill="#8884d8"
                dataKey="value"
                animationDuration={500}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#fff" 
                    strokeWidth={2} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center">
            <p className="text-gray-400 font-semibold">No votes yet</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 border-t border-gray-200">
        <div className="space-y-2 mt-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 font-medium truncate text-xs">
                  {item.letter} - {item.name}
                </span>
              </div>
              <div className="text-right flex-shrink-0 min-w-[80px]">
                <span className="font-bold text-gray-900 text-sm">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({item.value})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isConnected && questionTotalVotes > 0 && (
        <div className="bg-green-50 border-t border-green-300 px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-800">
              Live • Updates in real-time
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
// // src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// // ✅ PDF #10 - Compact Pie Chart beside ballot during voting - IMPROVED DESIGN
// import React, { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/ballotApi';
// import io from 'socket.io-client';
// import { RefreshCw } from 'lucide-react';

// const SOCKET_URL = import.meta.env.VITE_VOTING_SERVICE_URL?.replace('/api', '') || 'http://localhost:3007';
// /*eslint-disable*/
// export default function CompactLiveResults({ electionId, questionId }) {
//   const [liveData, setLiveData] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // PDF #10 exact colors
//   const PDF_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

//   // Initial fetch
//   const { data: initialData, isLoading, refetch } = useGetLiveResultsQuery(electionId);

//   useEffect(() => {
//     if (initialData) {
//       console.log('📊 Compact chart - initial data loaded');
//       setLiveData(initialData);
//     }
//   }, [initialData]);

//   // Socket.IO real-time updates
//   useEffect(() => {
//     if (!electionId) return;

//     const newSocket = io(SOCKET_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//     });

//     newSocket.on('connect', () => {
//       console.log('✅ Compact chart - Socket connected');
//       setIsConnected(true);
//       newSocket.emit('join-election', electionId);
//     });

//     newSocket.on('disconnect', () => {
//       console.log('❌ Compact chart - Socket disconnected');
//       setIsConnected(false);
//     });

//     newSocket.on('vote-cast', () => {
//       console.log('🗳️ Compact chart - Vote detected, refreshing...');
//       refetch();
//     });

//     newSocket.on('live-results-update', (updatedResults) => {
//       console.log('📊 Compact chart - Live update received');
//       setLiveData(updatedResults);
//     });

//     setSocket(newSocket);

//     return () => {
//       if (newSocket) {
//         newSocket.emit('leave-election', electionId);
//         newSocket.disconnect();
//       }
//     };
//   }, [electionId, refetch]);

//   const resultsData = liveData || initialData;
//   const question = resultsData?.questions?.[0];
//   const options = question?.options || [];
//   const totalVotes = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

//   // Prepare chart data
//   const chartData = options.map((option, index) => ({
//     name: option.option_text,
//     value: option.vote_count || 0,
//     percentage: parseFloat(option.percentage || 0),
//     color: PDF_COLORS[index % PDF_COLORS.length],
//     letter: String.fromCharCode(65 + index), // A, B, C...
//   }));

//   // Custom label - improved positioning
//   const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
//     if (percent === 0) return null;
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor="middle"
//         dominantBaseline="central"
//         className="font-bold"
//         style={{ fontSize: '14px' }}
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   // Custom tooltip
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload?.[0]) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white px-3 py-2 rounded-lg shadow-lg border-2 border-gray-200">
//           <p className="font-bold text-gray-900 text-sm">{data.name}</p>
//           <p className="text-xs text-gray-600">
//             {data.value} vote{data.value !== 1 ? 's' : ''} ({data.percentage.toFixed(1)}%)
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   if (isLoading && !liveData) {
//     return (
//       <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg p-4">
//         <div className="animate-pulse">
//           <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//           <div className="h-48 bg-gray-100 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl border-3 border-gray-400 shadow-lg overflow-hidden">
//       {/* Header */}
//       <div className="bg-gray-100 border-b-2 border-gray-400 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex-1">
//             <h3 className="text-lg font-bold text-gray-900">
//               Live Results
//             </h3>
//             <p className="text-sm text-gray-600 mt-0.5">
//               {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
//             </p>
//           </div>
//           <button
//             onClick={() => refetch()}
//             className="text-blue-600 hover:text-blue-700 transition p-1"
//             title="Refresh"
//           >
//             <RefreshCw className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* Pie Chart */}
//       <div className="p-4">
//         {totalVotes > 0 ? (
//           <ResponsiveContainer width="100%" height={220}>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={renderLabel}
//                 outerRadius={80}
//                 innerRadius={48}
//                 fill="#8884d8"
//                 dataKey="value"
//                 animationDuration={500}
//               >
//                 {chartData.map((entry, index) => (
//                   <Cell 
//                     key={`cell-${index}`} 
//                     fill={entry.color} 
//                     stroke="#fff" 
//                     strokeWidth={2} 
//                   />
//                 ))}
//               </Pie>
//               <Tooltip content={<CustomTooltip />} />
//             </PieChart>
//           </ResponsiveContainer>
//         ) : (
//           // Empty state
//           <div className="h-52 flex items-center justify-center">
//             <svg viewBox="0 0 200 200" className="w-48 h-48">
//               {chartData.map((item, index) => {
//                 const angle = (360 / chartData.length) * index;
//                 const nextAngle = (360 / chartData.length) * (index + 1);
//                 const largeArc = (nextAngle - angle) > 180 ? 1 : 0;
//                 const startX = 100 + 60 * Math.cos((angle * Math.PI) / 180);
//                 const startY = 100 + 60 * Math.sin((angle * Math.PI) / 180);
//                 const endX = 100 + 60 * Math.cos((nextAngle * Math.PI) / 180);
//                 const endY = 100 + 60 * Math.sin((nextAngle * Math.PI) / 180);
                
//                 return (
//                   <path
//                     key={index}
//                     d={`M 100 100 L ${startX} ${startY} A 60 60 0 ${largeArc} 1 ${endX} ${endY} Z`}
//                     fill={item.color}
//                     opacity="0.2"
//                     stroke="white"
//                     strokeWidth="2"
//                   />
//                 );
//               })}
//               <circle cx="100" cy="100" r="35" fill="white" />
//               <text x="100" y="105" textAnchor="middle" className="text-sm font-bold fill-gray-400">
//                 No votes yet
//               </text>
//             </svg>
//           </div>
//         )}
//       </div>

//       {/* Legend - PDF #10 Style - IMPROVED */}
//       <div className="px-4 pb-4 border-t border-gray-200">
//         <div className="space-y-2 mt-3">
//           {chartData.map((item, index) => (
//             <div key={index} className="flex items-center justify-between text-sm">
//               <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
//                 <div 
//                   className="w-3 h-3 rounded-sm flex-shrink-0"
//                   style={{ backgroundColor: item.color }}
//                 />
//                 <span className="text-gray-700 font-medium truncate text-xs">
//                   {item.letter} - {item.name}
//                 </span>
//               </div>
//               <div className="text-right flex-shrink-0 min-w-[80px]">
//                 <span className="font-bold text-gray-900 text-sm">
//                   {item.percentage.toFixed(1)}%
//                 </span>
//                 <span className="text-xs text-gray-500 ml-1">
//                   ({item.value})
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Live indicator */}
//       {isConnected && totalVotes > 0 && (
//         <div className="bg-green-50 border-t border-green-300 px-4 py-2">
//           <div className="flex items-center justify-center gap-2">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//             <span className="text-xs font-semibold text-green-800">
//               Live • Updates in real-time
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// // ✅ PDF #10 - Compact Pie Chart beside ballot during voting
// import React, { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/ballotApi';
// import io from 'socket.io-client';
// import { RefreshCw } from 'lucide-react';

// const SOCKET_URL = import.meta.env.VITE_VOTING_SERVICE_URL?.replace('/api', '') || 'http://localhost:3007';
// /*eslint-disable*/
// export default function CompactLiveResults({ electionId, questionId }) {
//   const [liveData, setLiveData] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // PDF #10 exact colors
//   const PDF_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

//   // Initial fetch
//   const { data: initialData, isLoading, refetch } = useGetLiveResultsQuery(electionId);

//   useEffect(() => {
//     if (initialData) {
//       console.log('📊 Compact chart - initial data loaded');
//       setLiveData(initialData);
//     }
//   }, [initialData]);

//   // Socket.IO real-time updates
//   useEffect(() => {
//     if (!electionId) return;

//     const newSocket = io(SOCKET_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//     });

//     newSocket.on('connect', () => {
//       console.log('✅ Compact chart - Socket connected');
//       setIsConnected(true);
//       newSocket.emit('join-election', electionId);
//     });

//     newSocket.on('disconnect', () => {
//       console.log('❌ Compact chart - Socket disconnected');
//       setIsConnected(false);
//     });

//     newSocket.on('vote-cast', () => {
//       console.log('🗳️ Compact chart - Vote detected, refreshing...');
//       refetch();
//     });

//     newSocket.on('live-results-update', (updatedResults) => {
//       console.log('📊 Compact chart - Live update received');
//       setLiveData(updatedResults);
//     });

//     setSocket(newSocket);

//     return () => {
//       if (newSocket) {
//         newSocket.emit('leave-election', electionId);
//         newSocket.disconnect();
//       }
//     };
//   }, [electionId, refetch]);

//   const resultsData = liveData || initialData;
//   const question = resultsData?.questions?.[0];
//   const options = question?.options || [];
//   const totalVotes = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

//   // Prepare chart data
//   const chartData = options.map((option, index) => ({
//     name: option.option_text,
//     value: option.vote_count || 0,
//     percentage: parseFloat(option.percentage || 0),
//     color: PDF_COLORS[index % PDF_COLORS.length],
//     letter: String.fromCharCode(65 + index), // A, B, C...
//   }));

//   // Custom label
//   const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
//     if (percent === 0) return null;
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor={x > cx ? 'start' : 'end'}
//         dominantBaseline="central"
//         className="font-bold text-xs"
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   // Custom tooltip
//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload?.[0]) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-bold text-gray-900 text-sm">{data.name}</p>
//           <p className="text-xs text-gray-600">
//             {data.value} vote{data.value !== 1 ? 's' : ''} ({data.percentage.toFixed(1)}%)
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   if (isLoading && !liveData) {
//     return (
//       <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg p-4">
//         <div className="animate-pulse">
//           <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//           <div className="h-48 bg-gray-100 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl border-3 border-gray-400 shadow-lg overflow-hidden">
//       {/* Header */}
//       <div className="bg-gray-100 border-b-2 border-gray-400 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-bold text-gray-900">
//             {totalVotes > 0 ? 'Live Results' : 'Waiting for Votes'}
//           </h3>
//           <button
//             onClick={() => refetch()}
//             className="text-blue-600 hover:text-blue-700 transition"
//             title="Refresh"
//           >
//             <RefreshCw className="w-4 h-4" />
//           </button>
//         </div>
//         <p className="text-sm text-gray-600 mt-1">
//           {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
//         </p>
//       </div>

//       {/* Pie Chart */}
//       <div className="p-4">
//         {totalVotes > 0 ? (
//           <ResponsiveContainer width="100%" height={200}>
//             <PieChart>
//               <Pie
//                 data={chartData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={renderLabel}
//                 outerRadius={70}
//                 innerRadius={40}
//                 fill="#8884d8"
//                 dataKey="value"
//                 animationDuration={500}
//               >
//                 {chartData.map((entry, index) => (
//                   <Cell 
//                     key={`cell-${index}`} 
//                     fill={entry.color} 
//                     stroke="#fff" 
//                     strokeWidth={2} 
//                   />
//                 ))}
//               </Pie>
//               <Tooltip content={<CustomTooltip />} />
//             </PieChart>
//           </ResponsiveContainer>
//         ) : (
//           // Empty state
//           <div className="h-48 flex items-center justify-center">
//             <svg viewBox="0 0 200 200" className="w-48 h-48">
//               {chartData.map((item, index) => {
//                 const angle = (360 / chartData.length) * index;
//                 const nextAngle = (360 / chartData.length) * (index + 1);
//                 const largeArc = (nextAngle - angle) > 180 ? 1 : 0;
//                 const startX = 100 + 60 * Math.cos((angle * Math.PI) / 180);
//                 const startY = 100 + 60 * Math.sin((angle * Math.PI) / 180);
//                 const endX = 100 + 60 * Math.cos((nextAngle * Math.PI) / 180);
//                 const endY = 100 + 60 * Math.sin((nextAngle * Math.PI) / 180);
                
//                 return (
//                   <path
//                     key={index}
//                     d={`M 100 100 L ${startX} ${startY} A 60 60 0 ${largeArc} 1 ${endX} ${endY} Z`}
//                     fill={item.color}
//                     opacity="0.2"
//                     stroke="white"
//                     strokeWidth="2"
//                   />
//                 );
//               })}
//               <circle cx="100" cy="100" r="35" fill="white" />
//               <text x="100" y="105" textAnchor="middle" className="text-sm font-bold fill-gray-400">
//                 No votes yet
//               </text>
//             </svg>
//           </div>
//         )}
//       </div>

//       {/* Legend - PDF #10 Style */}
//       <div className="px-4 pb-4 border-t border-gray-200">
//         <div className="space-y-1.5 mt-3">
//           {chartData.map((item, index) => (
//             <div key={index} className="flex items-center justify-between text-sm">
//               <div className="flex items-center gap-2 flex-1 min-w-0">
//                 <div 
//                   className="w-3 h-3 rounded-sm flex-shrink-0"
//                   style={{ backgroundColor: item.color }}
//                 />
//                 <span className="text-gray-700 font-medium truncate">
//                   {item.letter} - {item.name}
//                 </span>
//               </div>
//               <div className="text-right ml-2 flex-shrink-0">
//                 <span className="font-bold text-gray-900">
//                   {item.percentage.toFixed(1)}%
//                 </span>
//                 <span className="text-xs text-gray-500 ml-1">
//                   ({item.value})
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Live indicator */}
//       {isConnected && totalVotes > 0 && (
//         <div className="bg-green-50 border-t border-green-300 px-4 py-2">
//           <div className="flex items-center justify-center gap-2">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//             <span className="text-xs font-semibold text-green-800">
//               Live • Updates in real-time
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }