// src/components/Dashboard/Tabs/voting/RankedChoiceBallot.jsx
// ✅ Ranked Choice Voting - Rank candidates by preference (1st, 2nd, 3rd, etc.)
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function RankedChoiceBallot({ 
  ballot,
  answers = {},
  onAnswersChange,
  disabled = false,
  /*eslint-disable*/
  validationErrors = [],
  electionId,
}) {
  const questions = ballot?.questions || [];

  // answers format: { questionId: { candidateId: rank, candidateId2: rank2, ... } }
  const handleRankSelect = (questionId, candidateId, rank) => {
    if (disabled) return;
    
    const currentAnswers = answers[questionId] || {};
    
    // Remove this rank from any other candidate
    const newAnswers = {};
    Object.keys(currentAnswers).forEach(cId => {
      if (currentAnswers[cId] !== rank) {
        newAnswers[cId] = currentAnswers[cId];
      }
    });
    
    // Remove any existing rank for this candidate
    delete newAnswers[candidateId];
    
    // Assign new rank to this candidate
    newAnswers[candidateId] = rank;
    
    onAnswersChange({
      ...answers,
      [questionId]: newAnswers,
    });
  };

  const clearRank = (questionId, candidateId) => {
    if (disabled) return;
    
    const currentAnswers = { ...(answers[questionId] || {}) };
    delete currentAnswers[candidateId];
    
    onAnswersChange({
      ...answers,
      [questionId]: currentAnswers,
    });
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-yellow-800 font-semibold">No ballot questions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questions.map((question, questionIndex) => {
        const candidates = question?.options || [];
        const questionId = question?.id;
        const questionAnswers = answers[questionId] || {};
        const questionTitle = question?.question_text || question?.title || `Question ${questionIndex + 1}`;
        const maxRanks = Math.min(candidates.length, 5); // Show up to 5 rank columns

        return (
          <div 
            key={questionId || questionIndex} 
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300"
          >
            {/* Question Header */}
            <div className="bg-indigo-800 text-white py-4 px-6">
              <div className="flex items-center gap-3">
                <span className="bg-white text-indigo-800 text-sm font-bold px-3 py-1 rounded">
                  Q{questionIndex + 1}
                </span>
                <h3 className="text-lg font-bold flex-1">
                  {questionTitle}
                </h3>
              </div>
            </div>

            {/* Ballot Title */}
            <div className="text-center py-4 border-b border-gray-300 bg-indigo-50">
              <h2 className="text-lg font-bold text-indigo-900">
                RANKED-CHOICE VOTING
              </h2>
              <p className="text-sm text-indigo-700 mt-1">
                Rank candidates in order of preference (1st = most preferred)
              </p>
            </div>

            {/* Ballot Table */}
            <div className="p-4 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left pb-3 pr-4 text-indigo-900 font-bold border-b-2 border-indigo-300">
                      Candidate
                    </th>
                    {Array.from({ length: maxRanks }, (_, i) => (
                      <th 
                        key={i} 
                        className="text-center pb-3 px-2 text-indigo-700 text-xs font-bold w-12 border-b-2 border-indigo-300"
                      >
                        {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => {
                    const candidateName = candidate?.option_text || candidate?.name || `Candidate ${index + 1}`;
                    const candidateRank = questionAnswers[candidate.id];

                    return (
                      <tr 
                        key={candidate.id || index} 
                        className={`border-b border-gray-200 ${candidateRank ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-indigo-900">
                            {candidateName}
                          </span>
                        </td>

                        {Array.from({ length: maxRanks }, (_, colIndex) => {
                          const rank = colIndex + 1;
                          const isSelected = candidateRank === rank;
                          // Check if this rank is used by another candidate
                          const rankUsedBy = Object.keys(questionAnswers).find(
                            cId => questionAnswers[cId] === rank && cId !== String(candidate.id)
                          );

                          return (
                            <td key={colIndex} className="text-center py-3 px-2">
                              <div className="flex justify-center">
                                <div 
                                  onClick={() => {
                                    if (isSelected) {
                                      clearRank(questionId, candidate.id);
                                    } else {
                                      handleRankSelect(questionId, candidate.id, rank);
                                    }
                                  }}
                                  className={`
                                    w-7 h-7 rounded-full border-2 cursor-pointer transition-all
                                    flex items-center justify-center
                                    ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-indigo-500'}
                                    ${isSelected 
                                      ? 'border-indigo-800 bg-indigo-800' 
                                      : 'border-gray-400 bg-white'
                                    }
                                  `}
                                >
                                  {isSelected && (
                                    <span className="text-white text-xs font-bold">●</span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selection Summary */}
            <div className="bg-indigo-50 border-t border-indigo-200 px-4 py-3">
              <p className="text-indigo-800 text-sm font-medium">
                {Object.keys(questionAnswers).length > 0 ? (
                  <>✓ You have ranked {Object.keys(questionAnswers).length} items(s)</>
                ) : (
                  <>⚠ Please rank at least one candidate</>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
//last workable code
// // src/components/Dashboard/Tabs/voting/RankedChoiceBallot.jsx
// // ✅ Clean Ranked Choice Ballot - No embedded pie chart
// import React, { useState } from 'react';

// export default function RankedChoiceBallot({ 
//   ballot,
//   answers,
//   onAnswersChange,
//   disabled = false,
//   /*eslint-disable*/
//   validationErrors = [],
//   electionId,
// }) {
//   const question = ballot?.questions?.[0];
//   const candidates = question?.options || [];
//   const questionId = question?.id;
  
//   const [rankings, setRankings] = useState(answers[questionId] || {});

//   const handleRankSelect = (candidateId, rank) => {
//     if (disabled) return;

//     const candidateWithThisRank = Object.entries(rankings).find(
//       ([id, r]) => r === rank && parseInt(id) !== candidateId
//     );

//     let newRankings = { ...rankings };

//     if (candidateWithThisRank) {
//       const [otherId] = candidateWithThisRank;
//       newRankings[otherId] = rankings[candidateId] || null;
//     }

//     newRankings[candidateId] = rank;

//     setRankings(newRankings);
//     onAnswersChange({
//       [questionId]: newRankings,
//     });
//   };

//   const clearRank = (candidateId) => {
//     if (disabled) return;
//     const newRankings = { ...rankings };
//     delete newRankings[candidateId];
//     setRankings(newRankings);
//     onAnswersChange({
//       [questionId]: newRankings,
//     });
//   };

//   if (!question) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   const rankColumns = [1, 2, 3, 4, 5];

//   return (
//     <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden">
//       <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
//         <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
//           RANKED-CHOICE VOTING
//         </h2>
//         <p className="text-center text-gray-700 font-medium">
//           {question.question_text}
//         </p>
//       </div>

//       <div className="bg-purple-50 border-b-2 border-purple-200 px-6 py-3">
//         <p className="text-sm text-purple-900 font-semibold text-center">
//           Rank candidates by preference. Elimination rounds until majority.
//         </p>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-gray-200 border-b-2 border-gray-400">
//               <th className="text-left px-4 py-3 font-bold text-gray-800 border-r border-gray-300 text-sm">
//                 Candidate
//               </th>
//               {rankColumns.map(rank => (
//                 <th 
//                   key={rank}
//                   className="text-center px-2 py-3 font-bold text-gray-800 border-r border-gray-300 w-16 text-sm"
//                 >
//                   {rank === 1 && '1st'}
//                   {rank === 2 && '2nd'}
//                   {rank === 3 && '3rd'}
//                   {rank === 4 && '4th'}
//                   {rank === 5 && '5th'}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {candidates.map((candidate, index) => {
//               const candidateRank = rankings[candidate.id];
//               const candidateLetter = String.fromCharCode(65 + index);
              
//               return (
//                 <tr 
//                   key={candidate.id}
//                   className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="px-4 py-4 border-r border-gray-300">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
//                         {candidateLetter}
//                       </div>
//                       <div>
//                         <p className="font-semibold text-gray-900 text-sm">
//                           {candidate.option_text}
//                         </p>
//                         {candidateRank && (
//                           <p className="text-xs text-purple-600 font-semibold">
//                             Ranked: {candidateRank === 1 ? '1st' : candidateRank === 2 ? '2nd' : candidateRank === 3 ? '3rd' : `${candidateRank}th`}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </td>

//                   {rankColumns.map(rank => {
//                     const isSelected = candidateRank === rank;
                    
//                     return (
//                       <td 
//                         key={rank}
//                         className="px-2 py-4 border-r border-gray-300 text-center"
//                       >
//                         <div className="flex justify-center">
//                           <button
//                             onClick={() => 
//                               isSelected 
//                                 ? clearRank(candidate.id)
//                                 : handleRankSelect(candidate.id, rank)
//                             }
//                             disabled={disabled}
//                             className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-lg transition-all ${
//                               isSelected
//                                 ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
//                                 : 'border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50 text-gray-600'
//                             } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                           >
//                             {isSelected && '●'}
//                           </button>
//                         </div>
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-3">
//         <p className="text-xs text-gray-700 text-center italic">
//           Voters rank candidates by preference. Elimination rounds until majority.
//         </p>
//       </div>

//       <div className="bg-purple-50 border-t-2 border-purple-300 px-6 py-3">
//         <p className="text-purple-900 font-bold text-center mb-2 text-sm">Your Ranking:</p>
//         <div className="flex flex-wrap justify-center gap-2">
//           {rankColumns.map(rank => {
//             const candidateId = Object.keys(rankings).find(id => rankings[id] === rank);
//             const candidate = candidates.find(c => c.id === parseInt(candidateId));
            
//             return (
//               <div 
//                 key={rank}
//                 className={`px-3 py-1 rounded-lg border-2 text-sm ${
//                   candidate 
//                     ? 'bg-purple-100 border-purple-400' 
//                     : 'bg-gray-100 border-gray-300'
//                 }`}
//               >
//                 <span className="font-bold text-gray-700">
//                   {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}:
//                 </span>
//                 <span className="ml-1 text-gray-900 text-xs">
//                   {candidate ? candidate.option_text : '—'}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {Object.keys(rankings).length === 0 && question.is_required && (
//         <div className="bg-orange-50 border-t-2 border-orange-300 px-6 py-3">
//           <p className="text-orange-800 font-semibold text-center text-sm">
//             ⚠️ Please rank at least one candidate
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
//last workable code
// // src/components/Dashboard/Tabs/voting/RankedChoiceBallot.jsx
// // ✅ 100% PDF #10 COMPLIANT - Ranked Choice with Real-time Pie Chart (5 columns)
// import React, { useState } from 'react';
// import LivePieChart from './LivePieChart';
// import useVotingSocket from '../../../../hooks/useVotingSocket';

// export default function RankedChoiceBallot({ 
//   ballot,
//   answers,
//   onAnswersChange,
//   disabled = false,
//   /*eslint-disable*/
//   validationErrors = [],
//   electionId, // ← REQUIRED for WebSocket
// }) {
//   const question = ballot?.questions?.[0];
//   const candidates = question?.options || [];
//   const questionId = question?.id;
  
//   const [rankings, setRankings] = useState(answers[questionId] || {});

//   // ✅ WebSocket for real-time updates
//   const { liveResults, isConnected } = useVotingSocket(electionId);

//   const handleRankSelect = (candidateId, rank) => {
//     if (disabled) return;

//     const candidateWithThisRank = Object.entries(rankings).find(
//       ([id, r]) => r === rank && parseInt(id) !== candidateId
//     );

//     let newRankings = { ...rankings };

//     if (candidateWithThisRank) {
//       const [otherId] = candidateWithThisRank;
//       newRankings[otherId] = rankings[candidateId] || null;
//     }

//     newRankings[candidateId] = rank;

//     setRankings(newRankings);
//     onAnswersChange({
//       [questionId]: newRankings,
//     });
//   };

//   const clearRank = (candidateId) => {
//     if (disabled) return;
//     const newRankings = { ...rankings };
//     delete newRankings[candidateId];
//     setRankings(newRankings);
//     onAnswersChange({
//       [questionId]: newRankings,
//     });
//   };

//   if (!question) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   const rankColumns = [1, 2, 3, 4, 5]; // PDF #10 shows 5 columns

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* LEFT SIDE - BALLOT TABLE */}
//       <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden">
//         <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
//           <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
//             RANKED-CHOICE VOTING
//           </h2>
//           <p className="text-center text-gray-700 font-medium">
//             {question.question_text}
//           </p>
//         </div>

//         <div className="bg-purple-50 border-b-2 border-purple-200 px-6 py-3">
//           <p className="text-sm text-purple-900 font-semibold text-center">
//             Rank candidates by preference. Elimination rounds until majority.
//           </p>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-200 border-b-2 border-gray-400">
//                 <th className="text-left px-4 py-3 font-bold text-gray-800 border-r border-gray-300 text-sm">
//                   Candidate
//                 </th>
//                 {rankColumns.map(rank => (
//                   <th 
//                     key={rank}
//                     className="text-center px-2 py-3 font-bold text-gray-800 border-r border-gray-300 w-16 text-sm"
//                   >
//                     {rank === 1 && '1st'}
//                     {rank === 2 && '2nd'}
//                     {rank === 3 && '3rd'}
//                     {rank === 4 && '4th'}
//                     {rank === 5 && '5th'}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {candidates.map((candidate, index) => {
//                 const candidateRank = rankings[candidate.id];
//                 const candidateLetter = String.fromCharCode(65 + index);
                
//                 return (
//                   <tr 
//                     key={candidate.id}
//                     className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-4 py-4 border-r border-gray-300">
//                       <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
//                           {candidateLetter}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-900 text-sm">
//                             {candidate.option_text}
//                           </p>
//                           {candidateRank && (
//                             <p className="text-xs text-purple-600 font-semibold">
//                               Ranked: {candidateRank === 1 ? '1st' : candidateRank === 2 ? '2nd' : candidateRank === 3 ? '3rd' : `${candidateRank}th`}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </td>

//                     {rankColumns.map(rank => {
//                       const isSelected = candidateRank === rank;
                      
//                       return (
//                         <td 
//                           key={rank}
//                           className="px-2 py-4 border-r border-gray-300 text-center"
//                         >
//                           <div className="flex justify-center">
//                             <button
//                               onClick={() => 
//                                 isSelected 
//                                   ? clearRank(candidate.id)
//                                   : handleRankSelect(candidate.id, rank)
//                               }
//                               disabled={disabled}
//                               className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-lg transition-all ${
//                                 isSelected
//                                   ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
//                                   : 'border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50 text-gray-600'
//                               } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                             >
//                               {isSelected && '●'}
//                             </button>
//                           </div>
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-3">
//           <p className="text-xs text-gray-700 text-center italic">
//             Voters rank candidates by preference. Elimination rounds until majority.
//           </p>
//         </div>

//         <div className="bg-purple-50 border-t-2 border-purple-300 px-6 py-3">
//           <p className="text-purple-900 font-bold text-center mb-2 text-sm">Your Ranking:</p>
//           <div className="flex flex-wrap justify-center gap-2">
//             {rankColumns.map(rank => {
//               const candidateId = Object.keys(rankings).find(id => rankings[id] === rank);
//               const candidate = candidates.find(c => c.id === parseInt(candidateId));
              
//               return (
//                 <div 
//                   key={rank}
//                   className={`px-3 py-1 rounded-lg border-2 text-sm ${
//                     candidate 
//                       ? 'bg-purple-100 border-purple-400' 
//                       : 'bg-gray-100 border-gray-300'
//                   }`}
//                 >
//                   <span className="font-bold text-gray-700">
//                     {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}:
//                   </span>
//                   <span className="ml-1 text-gray-900 text-xs">
//                     {candidate ? candidate.option_text : '—'}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {Object.keys(rankings).length === 0 && question.is_required && (
//           <div className="bg-orange-50 border-t-2 border-orange-300 px-6 py-3">
//             <p className="text-orange-800 font-semibold text-center text-sm">
//               ⚠️ Please rank at least one candidate
//             </p>
//           </div>
//         )}
//       </div>

//       {/* RIGHT SIDE - LIVE PIE CHART */}
//       <LivePieChart 
//         candidates={candidates}
//         liveResults={liveResults}
//         votingType="ranked_choice"
//       />
//     </div>
//   );
// }
//last workbale code to implement socket io above code
// // src/components/Dashboard/Tabs/voting/RankedChoiceBallot.jsx
// // ✅ 100% MATCHES PDF #10 "RANKED-CHOICE VOTING" WITH 5 COLUMNS AND PIE CHART
// import React, { useState } from 'react';

// export default function RankedChoiceBallot({ 
//   ballot,
//   answers,
//   onAnswersChange,
//   disabled = false,
//   /*eslint-disable*/
//   validationErrors = [],
// }) {
//   // Get the first question (main ballot question)
//   const question = ballot?.questions?.[0];
//   const candidates = question?.options || [];
//   const questionId = question?.id;
  
//   // State: { candidateId: rank } e.g., { 79: 1, 80: 3, 81: 2 }
//   const [rankings, setRankings] = useState(answers[questionId] || {});

//   const handleRankSelect = (candidateId, rank) => {
//     if (disabled) return;

//     // Check if this rank is already assigned to another candidate
//     const candidateWithThisRank = Object.entries(rankings).find(
//       ([id, r]) => r === rank && parseInt(id) !== candidateId
//     );

//     let newRankings = { ...rankings };

//     if (candidateWithThisRank) {
//       // Swap ranks
//       const [otherId] = candidateWithThisRank;
//       newRankings[otherId] = rankings[candidateId] || null;
//     }

//     // Assign new rank
//     newRankings[candidateId] = rank;

//     setRankings(newRankings);
//     onAnswersChange({
//       [questionId]: newRankings,
//     });
//   };

//   const clearRank = (candidateId) => {
//     if (disabled) return;
//     const newRankings = { ...rankings };
//     delete newRankings[candidateId];
//     setRankings(newRankings);
//     onAnswersChange({
//       [questionId]: newRankings,
//     });
//   };

//   if (!question) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   // ALWAYS show 5 ranks to match PDF #10 EXACTLY
//   const rankColumns = [1, 2, 3, 4, 5];

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* LEFT SIDE - BALLOT TABLE */}
//       <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
//           <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
//             RANKED-CHOICE VOTING
//           </h2>
//           <p className="text-center text-gray-700 font-medium">
//             {question.question_text}
//           </p>
//         </div>

//         {/* Instructions */}
//         <div className="bg-purple-50 border-b-2 border-purple-200 px-6 py-3">
//           <p className="text-sm text-purple-900 font-semibold text-center">
//             Rank candidates by preference. Elimination rounds until majority.
//           </p>
//         </div>

//         {/* Ballot Table - EXACT PDF #10 Format with 5 columns */}
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-200 border-b-2 border-gray-400">
//                 <th className="text-left px-4 py-3 font-bold text-gray-800 border-r border-gray-300 text-sm">
//                   Candidate
//                 </th>
//                 {rankColumns.map(rank => (
//                   <th 
//                     key={rank}
//                     className="text-center px-2 py-3 font-bold text-gray-800 border-r border-gray-300 w-16 text-sm"
//                   >
//                     {rank === 1 && '1st'}
//                     {rank === 2 && '2nd'}
//                     {rank === 3 && '3rd'}
//                     {rank === 4 && '4th'}
//                     {rank === 5 && '5th'}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {candidates.map((candidate, index) => {
//                 const candidateRank = rankings[candidate.id];
//                 const candidateLetter = String.fromCharCode(65 + index);
                
//                 return (
//                   <tr 
//                     key={candidate.id}
//                     className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
//                   >
//                     {/* Candidate Name */}
//                     <td className="px-4 py-4 border-r border-gray-300">
//                       <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
//                           {candidateLetter}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-900 text-sm">
//                             {candidate.option_text}
//                           </p>
//                           {candidateRank && (
//                             <p className="text-xs text-purple-600 font-semibold">
//                               Ranked: {candidateRank === 1 ? '1st' : candidateRank === 2 ? '2nd' : candidateRank === 3 ? '3rd' : `${candidateRank}th`}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </td>

//                     {/* Ranking Columns - 5 columns total */}
//                     {rankColumns.map(rank => {
//                       const isSelected = candidateRank === rank;
                      
//                       return (
//                         <td 
//                           key={rank}
//                           className="px-2 py-4 border-r border-gray-300 text-center"
//                         >
//                           <div className="flex justify-center">
//                             <button
//                               onClick={() => 
//                                 isSelected 
//                                   ? clearRank(candidate.id)
//                                   : handleRankSelect(candidate.id, rank)
//                               }
//                               disabled={disabled}
//                               className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-lg transition-all ${
//                                 isSelected
//                                   ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
//                                   : 'border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50 text-gray-600'
//                               } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                             >
//                               {isSelected && '●'}
//                             </button>
//                           </div>
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer Note */}
//         <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-3">
//           <p className="text-xs text-gray-700 text-center italic">
//             Voters rank candidates by preference. Elimination rounds until majority.
//           </p>
//         </div>

//         {/* Ranking Summary */}
//         <div className="bg-purple-50 border-t-2 border-purple-300 px-6 py-3">
//           <p className="text-purple-900 font-bold text-center mb-2 text-sm">Your Ranking:</p>
//           <div className="flex flex-wrap justify-center gap-2">
//             {rankColumns.map(rank => {
//               const candidateId = Object.keys(rankings).find(id => rankings[id] === rank);
//               const candidate = candidates.find(c => c.id === parseInt(candidateId));
              
//               return (
//                 <div 
//                   key={rank}
//                   className={`px-3 py-1 rounded-lg border-2 text-sm ${
//                     candidate 
//                       ? 'bg-purple-100 border-purple-400' 
//                       : 'bg-gray-100 border-gray-300'
//                   }`}
//                 >
//                   <span className="font-bold text-gray-700">
//                     {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}:
//                   </span>
//                   <span className="ml-1 text-gray-900 text-xs">
//                     {candidate ? candidate.option_text : '—'}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Warning */}
//         {Object.keys(rankings).length === 0 && question.is_required && (
//           <div className="bg-orange-50 border-t-2 border-orange-300 px-6 py-3">
//             <p className="text-orange-800 font-semibold text-center text-sm">
//               ⚠️ Please rank at least one candidate
//             </p>
//           </div>
//         )}
//       </div>

//       {/* RIGHT SIDE - PIE CHART (Exact PDF #10 Style) */}
//       <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden">
//         <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
//           <h2 className="text-xl font-bold text-gray-900 text-center">
//             Recommended Diet
//           </h2>
//         </div>

//         {/* Pie Chart */}
//         <div className="p-8">
//           <svg className="w-full h-80" viewBox="0 0 200 200">
//             {/* Pie Chart - matching PDF #10 colors and percentages */}
//             <circle cx="100" cy="100" r="70" fill="#10B981" />
//             <path d="M 100 100 L 100 30 A 70 70 0 0 1 146.86 45.73 Z" fill="#3B82F6" />
//             <path d="M 100 100 L 146.86 45.73 A 70 70 0 0 1 161.24 71.24 Z" fill="#22C55E" />
//             <path d="M 100 100 L 161.24 71.24 A 70 70 0 0 1 165.67 91.17 Z" fill="#EAB308" />
//             <path d="M 100 100 L 165.67 91.17 A 70 70 0 0 1 158.49 114.14 Z" fill="#F59E0B" />
//             <path d="M 100 100 L 158.49 114.14 A 70 70 0 0 1 100 30 Z" fill="#6B7280" />
            
//             {/* Center white circle */}
//             <circle cx="100" cy="100" r="35" fill="white" />
//           </svg>

//           {/* Legend - Exact PDF #10 style */}
//           <div className="mt-6 space-y-2">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-[#10B981]" />
//                 <span className="text-sm font-medium text-gray-700">Fruit</span>
//               </div>
//               <span className="text-sm font-bold text-gray-900">23%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-[#3B82F6]" />
//                 <span className="text-sm font-medium text-gray-700">Protein</span>
//               </div>
//               <span className="text-sm font-bold text-gray-900">18%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-[#22C55E]" />
//                 <span className="text-sm font-medium text-gray-700">Vegetables</span>
//               </div>
//               <span className="text-sm font-bold text-gray-900">15%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-[#EAB308]" />
//                 <span className="text-sm font-medium text-gray-700">Dairy</span>
//               </div>
//               <span className="text-sm font-bold text-gray-900">9%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-[#F59E0B]" />
//                 <span className="text-sm font-medium text-gray-700">Grains</span>
//               </div>
//               <span className="text-sm font-bold text-gray-900">5%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded bg-[#6B7280]" />
//                 <span className="text-sm font-medium text-gray-700">Other</span>
//               </div>
//               <span className="text-sm font-bold text-gray-900">30%</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//last working code
// // src/components/Dashboard/Tabs/voting/RankedChoiceBallot.jsx
// // ✨ Ranked Choice Voting - Drag & Drop Ranking
// import React, { useState, useEffect } from 'react';
// /*eslint-disable*/
// import { motion, Reorder } from 'framer-motion';
// import { GripVertical, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

// export default function RankedChoiceBallot({ 
//   ballot,
//   answers,
//   onAnswersChange,
//   disabled = false,
//   validationErrors = [],
// }) {
//   // Local state for each question's ranking
//   const [rankings, setRankings] = useState({});

//   // Initialize rankings from answers
//   useEffect(() => {
//     if (!ballot?.questions) return;

//     const initialRankings = {};
//     ballot.questions.forEach(question => {
//       if (answers[question.id] && Array.isArray(answers[question.id])) {
//         // Answers already in ranked order
//         initialRankings[question.id] = answers[question.id];
//       } else {
//         // Initialize with unranked options
//         initialRankings[question.id] = question.options?.map(o => o.id) || [];
//       }
//     });
//     setRankings(initialRankings);
//   }, [ballot, answers]);

//   const handleReorder = (questionId, newOrder) => {
//     setRankings(prev => ({
//       ...prev,
//       [questionId]: newOrder,
//     }));

//     // Update parent answers
//     onAnswersChange({
//       ...answers,
//       [questionId]: newOrder,
//     });
//   };

//   const moveOption = (questionId, optionId, direction) => {
//     const currentRanking = rankings[questionId] || [];
//     const currentIndex = currentRanking.indexOf(optionId);
    
//     if (
//       (direction === 'up' && currentIndex === 0) ||
//       (direction === 'down' && currentIndex === currentRanking.length - 1)
//     ) {
//       return; // Can't move
//     }

//     const newRanking = [...currentRanking];
//     const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
//     // Swap
//     [newRanking[currentIndex], newRanking[newIndex]] = 
//     [newRanking[newIndex], newRanking[currentIndex]];

//     handleReorder(questionId, newRanking);
//   };

//   const getOptionById = (options, optionId) => {
//     return options.find(o => o.id === optionId);
//   };

//   return (
//     <div className="space-y-8">
//       {ballot?.questions?.map((question, qIndex) => {
//         const ranking = rankings[question.id] || [];
//         const hasError = validationErrors.some(err => err.questionId === question.id);

//         return (
//           <motion.div
//             key={question.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: qIndex * 0.1 }}
//             className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
//               hasError ? 'border-red-300' : 'border-gray-200'
//             }`}
//           >
//             {/* Question Header */}
//             <div className="mb-6">
//               <div className="flex items-start gap-3 mb-3">
//                 <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
//                   {qIndex + 1}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-gray-800 mb-2">
//                     {question.question_text}
//                   </h3>
//                   {question.description && (
//                     <p className="text-gray-600 text-sm">{question.description}</p>
//                   )}
//                   <p className="text-purple-600 text-sm font-semibold mt-2">
//                     📊 Drag to rank options in order of preference (1st = most preferred)
//                   </p>
//                   {question.is_required && (
//                     <span className="inline-block mt-2 text-xs font-semibold text-red-600">
//                       * Required
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Error Message */}
//               {hasError && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mt-3">
//                   <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//                   <p className="text-red-700 text-sm">
//                     {validationErrors.find(err => err.questionId === question.id)?.message}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Ranked Options */}
//             <Reorder.Group
//               axis="y"
//               values={ranking}
//               onReorder={(newOrder) => handleReorder(question.id, newOrder)}
//               className="space-y-3"
//             >
//               {ranking.map((optionId, index) => {
//                 const option = getOptionById(question.options, optionId);
//                 if (!option) return null;

//                 return (
//                   <Reorder.Item
//                     key={optionId}
//                     value={optionId}
//                     className={`bg-gradient-to-r ${
//                       index === 0 ? 'from-yellow-50 to-orange-50 border-yellow-400' :
//                       index === 1 ? 'from-gray-50 to-gray-100 border-gray-400' :
//                       index === 2 ? 'from-orange-50 to-red-50 border-orange-400' :
//                       'from-gray-50 to-white border-gray-200'
//                     } border-2 rounded-xl p-4 cursor-grab active:cursor-grabbing ${
//                       disabled ? 'opacity-50' : ''
//                     }`}
//                   >
//                     <div className="flex items-center gap-4">
//                       {/* Drag Handle */}
//                       <GripVertical className="w-6 h-6 text-gray-400 flex-shrink-0" />

//                       {/* Rank Number */}
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
//                         index === 0 ? 'bg-yellow-500 text-white' :
//                         index === 1 ? 'bg-gray-400 text-white' :
//                         index === 2 ? 'bg-orange-500 text-white' :
//                         'bg-gray-300 text-gray-700'
//                       }`}>
//                         {index + 1}
//                       </div>

//                       {/* Option Content */}
//                       <div className="flex-1">
//                         <p className="font-semibold text-gray-800">
//                           {option.option_text}
//                         </p>
//                         {option.description && (
//                           <p className="text-gray-600 text-sm mt-1">
//                             {option.description}
//                           </p>
//                         )}
//                       </div>

//                       {/* Move Buttons */}
//                       {!disabled && (
//                         <div className="flex flex-col gap-1">
//                           <button
//                             onClick={() => moveOption(question.id, optionId, 'up')}
//                             disabled={index === 0}
//                             className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                           >
//                             <ArrowUp className="w-5 h-5 text-gray-600" />
//                           </button>
//                           <button
//                             onClick={() => moveOption(question.id, optionId, 'down')}
//                             disabled={index === ranking.length - 1}
//                             className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                           >
//                             <ArrowDown className="w-5 h-5 text-gray-600" />
//                           </button>
//                         </div>
//                       )}

//                       {/* Rank Badge */}
//                       {index < 3 && (
//                         <div className="text-2xl">
//                           {index === 0 && '🥇'}
//                           {index === 1 && '🥈'}
//                           {index === 2 && '🥉'}
//                         </div>
//                       )}
//                     </div>
//                   </Reorder.Item>
//                 );
//               })}
//             </Reorder.Group>

//             {/* Ranking Summary */}
//             <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
//               <p className="text-purple-800 font-semibold mb-2 text-sm">Your Ranking:</p>
//               <ol className="space-y-1">
//                 {ranking.slice(0, 3).map((optionId, index) => {
//                   const option = getOptionById(question.options, optionId);
//                   return (
//                     <li key={optionId} className="text-purple-700 text-sm">
//                       {index + 1}. {option?.option_text}
//                     </li>
//                   );
//                 })}
//                 {ranking.length > 3 && (
//                   <li className="text-purple-600 text-xs italic">
//                     ... and {ranking.length - 3} more
//                   </li>
//                 )}
//               </ol>
//             </div>
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// }