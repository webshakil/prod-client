// src/components/Dashboard/Tabs/voting/ApprovalBallot.jsx
// ✅ Approval Voting - Vote Yes or No for each candidate
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ApprovalBallot({ 
  ballot,
  answers = {},
  onAnswersChange,
  disabled = false,
  /*eslint-disable*/
  validationErrors = [],
  electionId,
}) {
  const questions = ballot?.questions || [];

  // answers format: { questionId: { candidateId: 'yes' | 'no', ... } }
  const handleVote = (questionId, candidateId, vote) => {
    if (disabled) return;
    
    const currentAnswers = answers[questionId] || {};
    
    onAnswersChange({
      ...answers,
      [questionId]: {
        ...currentAnswers,
        [candidateId]: vote,
      },
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

        const yesCount = Object.values(questionAnswers).filter(v => v === 'yes').length;

        return (
          <div 
            key={questionId || questionIndex} 
            className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300"
          >
            {/* Question Header */}
            <div className="bg-green-800 text-white py-4 px-6">
              <div className="flex items-center gap-3">
                <span className="bg-white text-green-800 text-sm font-bold px-3 py-1 rounded">
                  Q{questionIndex + 1}
                </span>
                <h3 className="text-lg font-bold flex-1">
                  {questionTitle}
                </h3>
              </div>
            </div>

            {/* Ballot Title */}
            <div className="text-center py-4 border-b-2 border-gray-300 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                Approval Voting
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vote for as many candidates as you like.
              </p>
            </div>

            {/* Ballot Table */}
            <div className="p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left pb-3 pr-4 text-gray-700 font-bold border-b-2 border-gray-300">
                      
                    </th>
                    <th className="text-center pb-3 px-4 text-green-700 font-bold w-20 border-b-2 border-gray-300">
                      Yes
                    </th>
                    <th className="text-center pb-3 px-4 text-red-700 font-bold w-20 border-b-2 border-gray-300">
                      No
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => {
                    const candidateName = candidate?.option_text || candidate?.name || `Candidate ${index + 1}`;
                    const currentVote = questionAnswers[candidate.id];

                    return (
                      <tr 
                        key={candidate.id || index} 
                        className={`border-b border-gray-200 ${
                          currentVote === 'yes' ? 'bg-green-50' : 
                          currentVote === 'no' ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="py-4 pr-4">
                          <span className="font-semibold text-gray-800">
                            {candidateName}
                          </span>
                        </td>

                        {/* Yes Button */}
                        <td className="text-center py-4 px-4">
                          <div className="flex justify-center">
                            <div 
                              onClick={() => handleVote(questionId, candidate.id, 'yes')}
                              className={`
                                w-8 h-8 rounded-full border-2 cursor-pointer transition-all
                                flex items-center justify-center
                                ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-green-500'}
                                ${currentVote === 'yes'
                                  ? 'border-green-700 bg-green-700' 
                                  : 'border-gray-400 bg-white'
                                }
                              `}
                            >
                              {currentVote === 'yes' && (
                                <span className="text-white text-sm font-bold">●</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* No Button */}
                        <td className="text-center py-4 px-4">
                          <div className="flex justify-center">
                            <div 
                              onClick={() => handleVote(questionId, candidate.id, 'no')}
                              className={`
                                w-8 h-8 rounded-full border-2 cursor-pointer transition-all
                                flex items-center justify-center
                                ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-red-500'}
                                ${currentVote === 'no'
                                  ? 'border-gray-700 bg-gray-700' 
                                  : 'border-gray-400 bg-white'
                                }
                              `}
                            >
                              {currentVote === 'no' && (
                                <span className="text-white text-sm font-bold">●</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 border-t-2 border-gray-300 px-4 py-3 text-center">
              <p className="text-gray-700 text-sm">
                The candidate with the most votes wins.
              </p>
              {yesCount > 0 && (
                <p className="text-green-700 text-sm font-medium mt-1">
                  ✓ You approved {yesCount} candidate(s)
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
//last workable code
// // src/components/Dashboard/Tabs/voting/ApprovalBallot.jsx
// // ✅ Approval Ballot with Yes/No circular checkboxes
// import React from 'react';

// export default function ApprovalBallot({ 
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
  
//   const approvals = answers[questionId] || {};

//   const handleApprovalSelect = (candidateId, approval) => {
//     if (disabled) return;

//     const newApprovals = {
//       ...approvals,
//       [candidateId]: approval,
//     };

//     onAnswersChange({
//       [questionId]: newApprovals,
//     });
//   };

//   if (!question) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   const approvedCount = Object.values(approvals).filter(v => v === 'yes').length;

//   return (
//     <div className="bg-white rounded-lg border-2 border-gray-900 shadow-lg overflow-hidden max-w-md mx-auto">
//       {/* Header */}
//       <div className="bg-white border-b-2 border-gray-900 px-6 py-4">
//         <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
//           Approval Voting
//         </h2>
//         <p className="text-center text-gray-700 text-sm">
//           Vote for as many candidates as you like.
//         </p>
//       </div>

//       {/* Ballot Table */}
//       <div className="p-6">
//         <table className="w-full border-collapse border-2 border-gray-900">
//           <thead>
//             <tr className="bg-gray-100 border-b-2 border-gray-900">
//               <th className="text-left px-4 py-3 font-bold text-gray-900 border-r-2 border-gray-900 text-sm">
                
//               </th>
//               <th className="text-center px-4 py-3 font-bold text-gray-900 border-r-2 border-gray-900 text-sm">
//                 Yes
//               </th>
//               <th className="text-center px-4 py-3 font-bold text-gray-900 text-sm">
//                 No
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {candidates.map((candidate, index) => {
//               const approval = approvals[candidate.id];
//               const isYes = approval === 'yes';
//               const isNo = approval === 'no';
              
//               return (
//                 <tr 
//                   key={candidate.id}
//                   className={`border-b-2 border-gray-900 ${
//                     index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
//                   }`}
//                 >
//                   <td className="px-4 py-3 border-r-2 border-gray-900">
//                     <div className="text-sm text-gray-900 font-medium">
//                       {candidate.option_text}
//                     </div>
//                   </td>

//                   <td className="px-4 py-3 border-r-2 border-gray-900 text-center">
//                     <div className="flex justify-center">
//                       <button
//                         onClick={() => handleApprovalSelect(candidate.id, 'yes')}
//                         disabled={disabled}
//                         type="button"
//                         className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
//                           isYes
//                             ? 'border-gray-900 bg-gray-900'
//                             : 'border-gray-400 bg-white hover:border-gray-600'
//                         } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                       >
//                       </button>
//                     </div>
//                   </td>

//                   <td className="px-4 py-3 text-center">
//                     <div className="flex justify-center">
//                       <button
//                         onClick={() => handleApprovalSelect(candidate.id, 'no')}
//                         disabled={disabled}
//                         type="button"
//                         className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
//                           isNo
//                             ? 'border-gray-900 bg-gray-900'
//                             : 'border-gray-400 bg-white hover:border-gray-600'
//                         } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                       >
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>

//         {/* Footer Note */}
//         <div className="mt-4 text-center">
//           <p className="text-xs text-gray-700 italic">
//             The candidate with the most votes wins.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
//last working code just to improve design above code
// // src/components/Dashboard/Tabs/voting/ApprovalBallot.jsx
// // ✅ Clean Approval Ballot - No embedded pie chart
// import React from 'react';

// export default function ApprovalBallot({ 
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
  
//   const approvals = answers[questionId] || {};

//   const handleApprovalSelect = (candidateId, approval) => {
//     if (disabled) return;

//     const newApprovals = {
//       ...approvals,
//       [candidateId]: approval,
//     };

//     onAnswersChange({
//       [questionId]: newApprovals,
//     });
//   };

//   if (!question) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   const approvedCount = Object.values(approvals).filter(v => v === 'yes').length;

//   return (
//     <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden">
//       <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
//         <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
//           Approval Voting
//         </h2>
//         <p className="text-center text-gray-700 font-medium">
//           {question.question_text}
//         </p>
//       </div>

//       <div className="bg-green-50 border-b-2 border-green-200 px-6 py-3">
//         <p className="text-sm text-green-900 font-semibold text-center">
//           Vote for as many candidates as you like.
//         </p>
//       </div>

//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200 border-b-2 border-gray-400">
//             <th className="text-left px-6 py-3 font-bold text-gray-800 border-r border-gray-300 text-base">
//               Candidate
//             </th>
//             <th className="text-center px-4 py-3 font-bold text-gray-800 border-r border-gray-300 w-20 text-base">
//               Yes
//             </th>
//             <th className="text-center px-4 py-3 font-bold text-gray-800 w-20 text-base">
//               No
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {candidates.map((candidate, index) => {
//             const approval = approvals[candidate.id];
//             const isYes = approval === 'yes';
//             const isNo = approval === 'no';
//             const candidateLetter = String.fromCharCode(65 + index);
            
//             return (
//               <tr 
//                 key={candidate.id}
//                 className={`border-b border-gray-300 transition-colors ${
//                   isYes ? 'bg-green-50' : isNo ? 'bg-red-50' : 'hover:bg-gray-50'
//                 }`}
//               >
//                 <td className="px-6 py-4 border-r border-gray-300">
//                   <div className="flex items-center gap-3">
//                     <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
//                       isYes 
//                         ? 'bg-green-600 text-white' 
//                         : isNo 
//                         ? 'bg-red-600 text-white' 
//                         : 'bg-gray-700 text-white'
//                     }`}>
//                       {candidateLetter}
//                     </div>
                    
//                     <div>
//                       <p className="font-semibold text-gray-900 text-base">
//                         {candidate.option_text}
//                       </p>
//                       {approval && (
//                         <p className={`text-xs font-semibold mt-1 ${
//                           isYes ? 'text-green-600' : 'text-red-600'
//                         }`}>
//                           {isYes ? '✓ Approved' : '✗ Not Approved'}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </td>

//                 <td className="px-4 py-4 border-r border-gray-300 text-center">
//                   <div className="flex justify-center">
//                     <button
//                       onClick={() => handleApprovalSelect(candidate.id, 'yes')}
//                       disabled={disabled}
//                       className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-xl transition-all ${
//                         isYes
//                           ? 'border-green-600 bg-green-600 text-white shadow-lg'
//                           : 'border-gray-400 bg-white hover:border-green-400 hover:bg-green-50 text-gray-400'
//                       } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                     >
//                       {isYes && '●'}
//                     </button>
//                   </div>
//                 </td>

//                 <td className="px-4 py-4 text-center">
//                   <div className="flex justify-center">
//                     <button
//                       onClick={() => handleApprovalSelect(candidate.id, 'no')}
//                       disabled={disabled}
//                       className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-xl transition-all ${
//                         isNo
//                           ? 'border-red-600 bg-red-600 text-white shadow-lg'
//                           : 'border-gray-400 bg-white hover:border-red-400 hover:bg-red-50 text-gray-400'
//                       } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//                     >
//                       {isNo && '●'}
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-3">
//         <p className="text-xs text-gray-700 text-center italic">
//           The candidate with the most votes wins.
//         </p>
//       </div>

//       <div className="bg-green-50 border-t-2 border-green-300 px-6 py-3">
//         <p className="text-green-900 font-bold text-center mb-2 text-sm">
//           Approved: {approvedCount} of {candidates.length}
//         </p>
//         {approvedCount > 0 && (
//           <div className="flex flex-wrap justify-center gap-2">
//             {Object.entries(approvals)
//               .filter(([_, approval]) => approval === 'yes')
//               .map(([candidateId]) => {
//                 const candidate = candidates.find(c => c.id === parseInt(candidateId));
//                 return (
//                   <span 
//                     key={candidateId}
//                     className="bg-green-200 text-green-900 px-2 py-1 rounded-full text-xs font-semibold"
//                   >
//                     ✓ {candidate?.option_text}
//                   </span>
//                 );
//               })}
//           </div>
//         )}
//       </div>

//       {approvedCount === 0 && question.is_required && (
//         <div className="bg-orange-50 border-t-2 border-orange-300 px-6 py-3">
//           <p className="text-orange-800 font-semibold text-center text-sm">
//             ⚠️ Please approve at least one candidate
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }