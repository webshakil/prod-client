// src/components/Dashboard/Tabs/voting/PluralityBallot.jsx
// ✅ Plurality Ballot with Ranked Voting (1st-5th place)
import React from 'react';

export default function PluralityBallot({ 
  ballot,
  answers,
  onAnswersChange,
  disabled = false,
  /*eslint-disable*/
  validationErrors = [],
  electionId,
}) {
  // Get the first question (main ballot question)
  const question = ballot?.questions?.[0];
  const candidates = question?.options || [];
  const questionId = question?.id;
  const selectedCandidateId = answers[questionId];

  const handleCandidateSelect = (candidateId) => {
    if (disabled) return;
    onAnswersChange({
      [questionId]: candidateId,
    });
  };

  if (!question) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-semibold">No ballot questions available</p>
      </div>
    );
  }

  const ranks = ['1st', '2nd', '3rd', '4th', '5th'];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center py-6 px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Sample General Ballot
        </h2>
      </div>

      {/* Ballot Table */}
      <div className="px-8 pb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left pb-3 pr-4"></th>
              {ranks.map((rank) => (
                <th key={rank} className="text-center pb-3 px-2">
                  <span className="text-xs font-medium text-gray-600">{rank}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => {
              const candidateLetter = String.fromCharCode(65 + index);
              
              return (
                <tr key={candidate.id} className="border-t border-gray-200">
                  <td className="py-3 pr-4">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">
                        Candidate #{index + 1} ({candidateLetter}) - {candidate.option_text}
                      </span>
                    </div>
                  </td>
                  {ranks.map((rank, rankIndex) => {
                    const isSelected = selectedCandidateId === candidate.id;
                    
                    return (
                      <td key={rank} className="text-center py-3 px-2">
                        <div className="flex justify-center">
                          <div 
                            className={`w-6 h-6 border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-gray-800 bg-gray-800' 
                                : 'border-gray-400 bg-white hover:border-gray-600'
                            }`}
                            onClick={() => handleCandidateSelect(candidate.id)}
                          >
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
    </div>
  );
}
//last workable code just improve the design as like pdf
// // src/components/Dashboard/Tabs/voting/PluralityBallot.jsx
// // ✅ Clean Plurality Ballot - No embedded pie chart
// import React from 'react';
// import { Check } from 'lucide-react';

// export default function PluralityBallot({ 
//   ballot,
//   answers,
//   onAnswersChange,
//   disabled = false,
//   /*eslint-disable*/
//   validationErrors = [],
//   electionId,
// }) {
//   // Get the first question (main ballot question)
//   const question = ballot?.questions?.[0];
//   const candidates = question?.options || [];
//   const questionId = question?.id;
//   const selectedCandidateId = answers[questionId];

//   const handleCandidateSelect = (candidateId) => {
//     if (disabled) return;
//     onAnswersChange({
//       [questionId]: candidateId,
//     });
//   };

//   if (!question) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden">
//       {/* Header */}
//       <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
//         <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
//            General Ballot
//         </h2>
//         <p className="text-center text-gray-700 font-medium">
//           {question.question_text}
//         </p>
//       </div>

//       {/* Instructions */}
//       <div className="bg-blue-50 border-b-2 border-blue-200 px-6 py-3">
//         <p className="text-sm text-blue-900 font-semibold text-center">
//           Vote for ONE candidate only
//         </p>
//       </div>

//       {/* Ballot Table */}
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200 border-b-2 border-gray-400">
//             <th className="text-left px-6 py-3 font-bold text-gray-800 border-r border-gray-300 text-base">
//               Candidate
//             </th>
//             <th className="text-center px-6 py-3 font-bold text-gray-800 w-24 text-base">
//               Vote
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {candidates.map((candidate, index) => {
//             const isSelected = selectedCandidateId === candidate.id;
//             const candidateLetter = String.fromCharCode(65 + index);
            
//             return (
//               <tr 
//                 key={candidate.id}
//                 className={`border-b border-gray-300 transition-colors cursor-pointer ${
//                   isSelected ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-50'
//                 }`}
//                 onClick={() => handleCandidateSelect(candidate.id)}
//               >
//                 <td className="px-6 py-4 border-r border-gray-300">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
//                       {candidateLetter}
//                     </div>
//                     <div>
//                       <p className="font-semibold text-gray-900 text-base">
//                         Candidate #{index + 1} ({candidateLetter})
//                       </p>
//                       <p className="text-sm text-gray-700">
//                         {candidate.option_text}
//                       </p>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="px-6 py-4 text-center">
//                   <div className="flex justify-center">
//                     <div 
//                       className={`w-8 h-8 border-3 rounded flex items-center justify-center cursor-pointer transition-all ${
//                         isSelected 
//                           ? 'border-blue-600 bg-blue-600 shadow-lg' 
//                           : 'border-gray-400 bg-white hover:border-blue-400'
//                       }`}
//                     >
//                       {isSelected && <Check className="w-6 h-6 text-white font-bold stroke-[3]" />}
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {/* Footer Note */}
//       <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-3">
//         <p className="text-xs text-gray-700 text-center italic">
//           The candidate with the most votes wins.
//         </p>
//       </div>

//       {/* Selection Status */}
//       {selectedCandidateId ? (
//         <div className="bg-green-50 border-t-2 border-green-300 px-6 py-3">
//           <p className="text-green-800 font-semibold text-center text-sm">
//             ✓ Selected: {candidates.find(c => c.id === selectedCandidateId)?.option_text}
//           </p>
//         </div>
//       ) : question.is_required && (
//         <div className="bg-orange-50 border-t-2 border-orange-300 px-6 py-3">
//           <p className="text-orange-800 font-semibold text-center text-sm">
//             ⚠️ Please select one candidate
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }