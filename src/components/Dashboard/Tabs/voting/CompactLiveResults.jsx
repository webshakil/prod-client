// src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// ✅ FIXED VERSION - Compact Live Results with Pie Chart
import React from 'react';
import { RefreshCw, Users, TrendingUp } from 'lucide-react';
import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';

export default function CompactLiveResults({ electionId, questionId }) {
  // ✅ FIX #1: Pass parameters as object to match RTK Query definition
  const { data: results, isLoading, refetch, isFetching } = useGetLiveResultsQuery(
    { electionId, questionId },
    { 
      pollingInterval: 5000,  // ✅ FIX: Reduced from 10s to 5s for more real-time feel
      refetchOnMountOrArgChange: true,
    }
  );

  // ✅ FIX #2: Properly extract data from nested API response
  // API returns: { success: true, data: { questions: [...], totalVotes: N } }
  const apiData = results?.data || results;
  
  // Get questions array
  const questions = apiData?.questions || [];
  
  // Find target question (by ID or first question)
  const targetQuestion = questionId 
    ? questions.find(q => q.id === questionId || q.id === parseInt(questionId))
    : questions[0];
  
  // ✅ FIX #3: Get options/candidates from correct path
  const candidates = targetQuestion?.options || [];
  
  // ✅ FIX #4: Calculate total votes correctly
  const totalVotes = apiData?.totalVotes || 
                     targetQuestion?.total_votes ||
                     candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);

  console.log('📊 CompactLiveResults Debug:', {
    electionId,
    questionId,
    rawResults: results,
    apiData,
    questions,
    targetQuestion,
    candidates,
    totalVotes
  });

  // Colors for pie chart segments
  const colors = [
    { bg: '#3B82F6', label: 'A' }, // Blue
    { bg: '#EF4444', label: 'B' }, // Red
    { bg: '#22C55E', label: 'C' }, // Green
    { bg: '#F59E0B', label: 'D' }, // Amber
    { bg: '#8B5CF6', label: 'E' }, // Purple
    { bg: '#EC4899', label: 'F' }, // Pink
    { bg: '#06B6D4', label: 'G' }, // Cyan
    { bg: '#84CC16', label: 'H' }, // Lime
  ];

  // ✅ FIX #5: Improved pie segment calculation
  const calculatePieSegments = () => {
    if (candidates.length === 0) return [];
    
    // Calculate total for this question
    const questionTotal = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
    
    let currentAngle = 0;
    return candidates.map((candidate, index) => {
      const votes = candidate.vote_count || 0;
      const percentage = questionTotal > 0 ? (votes / questionTotal) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        ...candidate,
        votes,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: colors[index % colors.length].bg,
        label: colors[index % colors.length].label,
      };
    });
  };

  const pieSegments = calculatePieSegments();

  // SVG Pie Chart path generator
  /*eslint-disable*/
  const createPieSlice = (startAngle, endAngle, color) => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return path;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Live Results</h3>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 hover:bg-white/20 rounded-full transition"
            title="Refresh results"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
          <Users className="w-4 h-4" />
          <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No results yet</p>
            <p className="text-sm">Results will appear here</p>
          </div>
        ) : totalVotes === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No votes yet</p>
            <p className="text-sm">Be the first to vote!</p>
          </div>
        ) : (
          <>
            {/* Pie Chart */}
            <div className="flex justify-center mb-4">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {pieSegments.map((segment, index) => {
                  if (segment.percentage === 0) return null;
                  
                  // Handle 100% case (full circle)
                  if (segment.percentage >= 99.9) {
                    return (
                      <circle
                        key={index}
                        cx="100"
                        cy="100"
                        r="80"
                        fill={segment.color}
                      />
                    );
                  }
                  
                  return (
                    <path
                      key={index}
                      d={createPieSlice(segment.startAngle, segment.endAngle, segment.color)}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
                
                {/* Center labels */}
                {pieSegments.map((segment, index) => {
                  if (segment.percentage < 5) return null;
                  
                  const midAngle = (segment.startAngle + segment.endAngle) / 2;
                  const midRad = (midAngle - 90) * (Math.PI / 180);
                  const labelRadius = 50;
                  const x = 100 + labelRadius * Math.cos(midRad);
                  const y = 100 + labelRadius * Math.sin(midRad);
                  
                  return (
                    <g key={`label-${index}`}>
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-xs font-bold fill-white"
                      >
                        {segment.label}
                      </text>
                      <text
                        x={x}
                        y={y + 8}
                        textAnchor="middle"
                        className="text-xs font-medium fill-white"
                      >
                        {segment.percentage.toFixed(0)}%
                      </text>
                    </g>
                  );
                })}

                {/* Center hole (donut style) - optional */}
                <circle cx="100" cy="100" r="30" fill="white" />
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold fill-gray-700"
                >
                  {totalVotes}
                </text>
                <text
                  x="100"
                  y="115"
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  votes
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {pieSegments.map((segment, index) => {
                const candidateName = segment.option_text || segment.name || `Option ${index + 1}`;
                const votes = segment.votes || 0;
                const isLeading = votes === Math.max(...pieSegments.map(s => s.votes)) && votes > 0;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between text-sm p-2 rounded ${isLeading ? 'bg-yellow-50 border border-yellow-200' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-gray-700 truncate max-w-[120px]" title={candidateName}>
                        {segment.label} - {candidateName}
                      </span>
                      {isLeading && <span className="text-xs">🏆</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {segment.percentage.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({votes})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer - Live indicator */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Live • Auto-updates every 5s</span>
        </div>
      </div>
    </div>
  );
}
//last workable code only to add accumulated result above code
// // src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// // ✅ Compact Live Results with Pie Chart
// import React from 'react';
// import { RefreshCw, Users } from 'lucide-react';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';

// export default function CompactLiveResults({ electionId, questionId }) {
//   const { data: results, isLoading, refetch, isFetching } = useGetLiveResultsQuery(
//     { electionId, questionId },
//     { pollingInterval: 10000 } // Auto-refresh every 10 seconds
//   );

//   // ✅ FIXED: Access the correct data structure from API response
//   // API returns: { success: true, data: { questions: [{ options: [...] }], totalVotes } }
//   const apiData = results?.data || results;
  
//   // Get options from the first question, or from questionId if specified
//   const questions = apiData?.questions || [];
//   const targetQuestion = questionId 
//     ? questions.find(q => q.id === questionId || q.id === parseInt(questionId))
//     : questions[0];
  
//   // ✅ FIXED: Get candidates/options from the correct path
//   const candidates = targetQuestion?.options || 
//                      apiData?.candidates || 
//                      apiData?.options || 
//                      [];
  
//   // ✅ FIXED: Get total votes from API or calculate from options
//   const totalVotes = apiData?.totalVotes || 
//                      targetQuestion?.total_votes ||
//                      candidates.reduce((sum, c) => sum + (c.vote_count || c.votes || c.count || 0), 0);

//   console.log('📊 CompactLiveResults Debug:', {
//     electionId,
//     questionId,
//     rawResults: results,
//     apiData,
//     questions,
//     targetQuestion,
//     candidates,
//     totalVotes
//   });

//   // Colors for pie chart segments
//   const colors = [
//     { bg: '#3B82F6', label: 'A' }, // Blue
//     { bg: '#EF4444', label: 'B' }, // Red
//     { bg: '#22C55E', label: 'C' }, // Green
//     { bg: '#F59E0B', label: 'D' }, // Amber
//     { bg: '#8B5CF6', label: 'E' }, // Purple
//     { bg: '#EC4899', label: 'F' }, // Pink
//     { bg: '#06B6D4', label: 'G' }, // Cyan
//     { bg: '#84CC16', label: 'H' }, // Lime
//   ];

//   // Calculate pie chart segments
//   const calculatePieSegments = () => {
//     if (totalVotes === 0 || candidates.length === 0) return [];
    
//     let currentAngle = 0;
//     return candidates.map((candidate, index) => {
//       // ✅ FIXED: Handle different field names from API
//       const votes = candidate.vote_count || candidate.votes || candidate.count || 0;
//       const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
//       const angle = (percentage / 100) * 360;
//       const startAngle = currentAngle;
//       currentAngle += angle;
      
//       return {
//         ...candidate,
//         votes, // Normalize the votes field
//         percentage,
//         startAngle,
//         endAngle: currentAngle,
//         color: colors[index % colors.length].bg,
//         label: colors[index % colors.length].label,
//       };
//     });
//   };

//   const pieSegments = calculatePieSegments();

//   // SVG Pie Chart path generator
//   /*eslint-disable*/
//   const createPieSlice = (startAngle, endAngle, color) => {
//     const radius = 80;
//     const centerX = 100;
//     const centerY = 100;
    
//     // Convert angles to radians
//     const startRad = (startAngle - 90) * (Math.PI / 180);
//     const endRad = (endAngle - 90) * (Math.PI / 180);
    
//     // Calculate start and end points
//     const x1 = centerX + radius * Math.cos(startRad);
//     const y1 = centerY + radius * Math.sin(startRad);
//     const x2 = centerX + radius * Math.cos(endRad);
//     const y2 = centerY + radius * Math.sin(endRad);
    
//     // Determine if the arc should be drawn the long way
//     const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
//     // Create SVG path
//     const path = [
//       `M ${centerX} ${centerY}`,
//       `L ${x1} ${y1}`,
//       `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
//       'Z'
//     ].join(' ');
    
//     return path;
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
//         <div className="flex items-center justify-between">
//           <h3 className="font-bold text-lg">Live Results</h3>
//           <button 
//             onClick={() => refetch()}
//             disabled={isFetching}
//             className="p-2 hover:bg-white/20 rounded-full transition"
//           >
//             <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
//           </button>
//         </div>
//         <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
//           <Users className="w-4 h-4" />
//           <span>{totalVotes} votes cast</span>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4">
//         {isLoading ? (
//           <div className="flex items-center justify-center py-8">
//             <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
//           </div>
//         ) : totalVotes === 0 || candidates.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <p className="font-medium">No votes yet</p>
//             <p className="text-sm">Results will appear here</p>
//           </div>
//         ) : (
//           <>
//             {/* Pie Chart */}
//             <div className="flex justify-center mb-4">
//               <svg width="200" height="200" viewBox="0 0 200 200">
//                 {pieSegments.map((segment, index) => {
//                   if (segment.percentage === 0) return null;
                  
//                   // Handle 100% case
//                   if (segment.percentage >= 99.9) {
//                     return (
//                       <circle
//                         key={index}
//                         cx="100"
//                         cy="100"
//                         r="80"
//                         fill={segment.color}
//                       />
//                     );
//                   }
                  
//                   return (
//                     <path
//                       key={index}
//                       d={createPieSlice(segment.startAngle, segment.endAngle, segment.color)}
//                       fill={segment.color}
//                       stroke="white"
//                       strokeWidth="2"
//                     />
//                   );
//                 })}
                
//                 {/* Center labels */}
//                 {pieSegments.map((segment, index) => {
//                   if (segment.percentage < 5) return null; // Don't show label for tiny slices
                  
//                   const midAngle = (segment.startAngle + segment.endAngle) / 2;
//                   const midRad = (midAngle - 90) * (Math.PI / 180);
//                   const labelRadius = 50;
//                   const x = 100 + labelRadius * Math.cos(midRad);
//                   const y = 100 + labelRadius * Math.sin(midRad);
                  
//                   return (
//                     <g key={`label-${index}`}>
//                       <text
//                         x={x}
//                         y={y - 8}
//                         textAnchor="middle"
//                         className="text-xs font-bold fill-white"
//                       >
//                         {segment.label}
//                       </text>
//                       <text
//                         x={x}
//                         y={y + 8}
//                         textAnchor="middle"
//                         className="text-xs font-medium fill-white"
//                       >
//                         {segment.percentage.toFixed(0)}%
//                       </text>
//                     </g>
//                   );
//                 })}
//               </svg>
//             </div>

//             {/* Legend */}
//             <div className="space-y-2">
//               {pieSegments.map((segment, index) => {
//                 // ✅ FIXED: Handle different field names for candidate name
//                 const candidateName = segment.option_text || segment.name || segment.text || `Option ${index + 1}`;
//                 const votes = segment.votes || 0;
                
//                 return (
//                   <div 
//                     key={index}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div 
//                         className="w-4 h-4 rounded"
//                         style={{ backgroundColor: segment.color }}
//                       />
//                       <span className="text-gray-700 truncate max-w-[120px]">
//                         {segment.label} - {candidateName}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="font-bold text-gray-900">
//                         {segment.percentage.toFixed(1)}%
//                       </span>
//                       <span className="text-gray-500 text-xs">
//                         ({votes})
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Footer - Live indicator */}
//       {totalVotes > 0 && (
//         <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
//           <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
//             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//             <span>Live • Updates in real-time</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }













// // src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// // ✅ Compact Live Results with Pie Chart
// import React from 'react';
// import { RefreshCw, Users } from 'lucide-react';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';

// export default function CompactLiveResults({ electionId, questionId }) {
//   const { data: results, isLoading, refetch, isFetching } = useGetLiveResultsQuery(
//     { electionId, questionId },
//     { pollingInterval: 10000 } // Auto-refresh every 10 seconds
//   );

//   const candidates = results?.candidates || results?.options || [];
//   const totalVotes = results?.totalVotes || candidates.reduce((sum, c) => sum + (c.votes || c.count || 0), 0);

//   // Colors for pie chart segments
//   const colors = [
//     { bg: '#3B82F6', label: 'A' }, // Blue
//     { bg: '#EF4444', label: 'B' }, // Red
//     { bg: '#22C55E', label: 'C' }, // Green
//     { bg: '#F59E0B', label: 'D' }, // Amber
//     { bg: '#8B5CF6', label: 'E' }, // Purple
//     { bg: '#EC4899', label: 'F' }, // Pink
//     { bg: '#06B6D4', label: 'G' }, // Cyan
//     { bg: '#84CC16', label: 'H' }, // Lime
//   ];

//   // Calculate pie chart segments
//   const calculatePieSegments = () => {
//     if (totalVotes === 0) return [];
    
//     let currentAngle = 0;
//     return candidates.map((candidate, index) => {
//       const votes = candidate.votes || candidate.count || 0;
//       const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
//       const angle = (percentage / 100) * 360;
//       const startAngle = currentAngle;
//       currentAngle += angle;
      
//       return {
//         ...candidate,
//         percentage,
//         startAngle,
//         endAngle: currentAngle,
//         color: colors[index % colors.length].bg,
//         label: colors[index % colors.length].label,
//       };
//     });
//   };

//   const pieSegments = calculatePieSegments();

//   // SVG Pie Chart path generator
// /*eslint-disable*/
//   const createPieSlice = (startAngle, endAngle, color) => {
//     const radius = 80;
//     const centerX = 100;
//     const centerY = 100;
    
//     // Convert angles to radians
//     const startRad = (startAngle - 90) * (Math.PI / 180);
//     const endRad = (endAngle - 90) * (Math.PI / 180);
    
//     // Calculate start and end points
//     const x1 = centerX + radius * Math.cos(startRad);
//     const y1 = centerY + radius * Math.sin(startRad);
//     const x2 = centerX + radius * Math.cos(endRad);
//     const y2 = centerY + radius * Math.sin(endRad);
    
//     // Determine if the arc should be drawn the long way
//     const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
//     // Create SVG path
//     const path = [
//       `M ${centerX} ${centerY}`,
//       `L ${x1} ${y1}`,
//       `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
//       'Z'
//     ].join(' ');
    
//     return path;
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
//         <div className="flex items-center justify-between">
//           <h3 className="font-bold text-lg">Live Results</h3>
//           <button 
//             onClick={() => refetch()}
//             disabled={isFetching}
//             className="p-2 hover:bg-white/20 rounded-full transition"
//           >
//             <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
//           </button>
//         </div>
//         <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
//           <Users className="w-4 h-4" />
//           <span>{totalVotes} votes cast</span>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4">
//         {isLoading ? (
//           <div className="flex items-center justify-center py-8">
//             <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
//           </div>
//         ) : totalVotes === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <p className="font-medium">No votes yet</p>
//             <p className="text-sm">Results will appear here</p>
//           </div>
//         ) : (
//           <>
//             {/* Pie Chart */}
//             <div className="flex justify-center mb-4">
//               <svg width="200" height="200" viewBox="0 0 200 200">
//                 {pieSegments.map((segment, index) => {
//                   if (segment.percentage === 0) return null;
                  
//                   // Handle 100% case
//                   if (segment.percentage >= 99.9) {
//                     return (
//                       <circle
//                         key={index}
//                         cx="100"
//                         cy="100"
//                         r="80"
//                         fill={segment.color}
//                       />
//                     );
//                   }
                  
//                   return (
//                     <path
//                       key={index}
//                       d={createPieSlice(segment.startAngle, segment.endAngle, segment.color)}
//                       fill={segment.color}
//                       stroke="white"
//                       strokeWidth="2"
//                     />
//                   );
//                 })}
                
//                 {/* Center labels */}
//                 {pieSegments.map((segment, index) => {
//                   if (segment.percentage < 5) return null; // Don't show label for tiny slices
                  
//                   const midAngle = (segment.startAngle + segment.endAngle) / 2;
//                   const midRad = (midAngle - 90) * (Math.PI / 180);
//                   const labelRadius = 50;
//                   const x = 100 + labelRadius * Math.cos(midRad);
//                   const y = 100 + labelRadius * Math.sin(midRad);
                  
//                   return (
//                     <g key={`label-${index}`}>
//                       <text
//                         x={x}
//                         y={y - 8}
//                         textAnchor="middle"
//                         className="text-xs font-bold fill-white"
//                       >
//                         {segment.label}
//                       </text>
//                       <text
//                         x={x}
//                         y={y + 8}
//                         textAnchor="middle"
//                         className="text-xs font-medium fill-white"
//                       >
//                         {segment.percentage.toFixed(0)}%
//                       </text>
//                     </g>
//                   );
//                 })}
//               </svg>
//             </div>

//             {/* Legend */}
//             <div className="space-y-2">
//               {pieSegments.map((segment, index) => {
//                 const candidateName = segment.option_text || segment.name || `Option ${index + 1}`;
//                 const votes = segment.votes || segment.count || 0;
                
//                 return (
//                   <div 
//                     key={index}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div 
//                         className="w-4 h-4 rounded"
//                         style={{ backgroundColor: segment.color }}
//                       />
//                       <span className="text-gray-700 truncate max-w-[120px]">
//                         {segment.label} - {candidateName}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="font-bold text-gray-900">
//                         {segment.percentage.toFixed(1)}%
//                       </span>
//                       <span className="text-gray-500 text-xs">
//                         ({votes})
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
//last workable code
// // src/components/Dashboard/Tabs/voting/CompactLiveResults.jsx
// // ✅ FINAL FIXED VERSION
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

//   const PDF_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

//   const { data: initialData, isLoading, refetch } = useGetLiveResultsQuery(electionId);

//   useEffect(() => {
//     if (initialData) {
//       console.log('📊 Compact chart - RAW API response:', initialData);
//       setLiveData(initialData);
//     }
//   }, [initialData]);

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
//       console.log('📊 Compact chart - Live update received:', updatedResults);
//       setLiveData({ success: true, data: updatedResults });
//     });

//     setSocket(newSocket);

//     return () => {
//       if (newSocket) {
//         newSocket.emit('leave-election', electionId);
//         newSocket.disconnect();
//       }
//     };
//   }, [electionId, refetch]);

//   // ⭐ CRITICAL FIX: Extract data properly
//   const rawData = liveData || initialData;
//   const resultsData = rawData?.data || rawData;
  
//   const apiTotalVotes = resultsData?.totalVotes || 0;
//   const question = resultsData?.questions?.[0];
//   const options = question?.options || [];
//   const questionTotalVotes = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

//   console.log('🔍 CompactLiveResults Data Structure:', {
//     hasRawData: !!rawData,
//     hasResultsData: !!resultsData,
//     apiTotalVotes,
//     questionTotalVotes,
//     optionsCount: options.length,
//     firstOption: options[0],
//   });

//   const chartData = options.map((option, index) => ({
//     name: option.option_text,
//     value: option.vote_count || 0,
//     percentage: parseFloat(option.percentage || 0),
//     color: PDF_COLORS[index % PDF_COLORS.length],
//     letter: String.fromCharCode(65 + index),
//   }));

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
//       <div className="bg-gray-100 border-b-2 border-gray-400 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex-1">
//             <h3 className="text-lg font-bold text-gray-900">
//               Live Results
//             </h3>
//             {/* ⭐ USE apiTotalVotes FROM API */}
//             <p className="text-sm text-gray-600 mt-0.5">
//               {apiTotalVotes} vote{apiTotalVotes !== 1 ? 's' : ''} cast
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

//       <div className="p-4">
//         {questionTotalVotes > 0 ? (
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
//           <div className="h-52 flex items-center justify-center">
//             <p className="text-gray-400 font-semibold">No votes yet</p>
//           </div>
//         )}
//       </div>

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

//       {isConnected && questionTotalVotes > 0 && (
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