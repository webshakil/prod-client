// src/components/Dashboard/Tabs/voting/PluralityBallot.jsx
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function PluralityBallot({ 
  ballot,
  answers = {},
  onAnswersChange,
  disabled = false,
  /*eslint-disable*/
  validationErrors = [],
  electionId,
}) {
  const questions = ballot?.questions || [];

  const selectCandidate = (questionId, candidateId) => {
    if (disabled) return;
    
    console.log('🗳️ CLICK! Question:', questionId, 'Candidate:', candidateId);
    
    const newAnswers = {
      ...answers,
      [questionId]: candidateId,
    };
    
    console.log('🗳️ New answers:', newAnswers);
    onAnswersChange(newAnswers);
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
        const selectedId = answers[questionId];
        const questionTitle = question?.question_text || question?.title || `Question ${questionIndex + 1}`;

        return (
          <div 
            key={questionId || questionIndex} 
            className="bg-white rounded-lg overflow-hidden border border-gray-300 shadow-lg"
          >
            {/* Question Header */}
            <div className="bg-gray-800 text-white py-3 px-5">
              <div className="flex items-center gap-3">
                <span className="bg-white text-gray-800 text-xs font-bold px-2.5 py-1 rounded">
                  Q{questionIndex + 1}
                </span>
                <h3 className="text-base font-semibold">{questionTitle}</h3>
              </div>
            </div>

            {/* Official Ballot Header */}
            <div className="text-center py-4 border-b border-gray-300">
              <h2 className="text-lg font-bold text-gray-800 italic">
                Official Ballot
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vote for <span className="font-bold">ONE</span> candidate only
              </p>
            </div>

            {/* Candidate Rows - Simple: Name on Left, Checkbox on Right */}
            <div className="divide-y divide-gray-200">
              {candidates.map((candidate, index) => {
                const candidateId = candidate.id;
                const candidateName = candidate?.option_text || candidate?.name || `Candidate ${index + 1}`;
                
                const isSelected = selectedId !== undefined && 
                                   selectedId !== null && 
                                   (selectedId === candidateId || String(selectedId) === String(candidateId));

                return (
                  <div
                    key={candidateId || index}
                    onClick={() => selectCandidate(questionId, candidateId)}
                    className={`
                      flex items-center justify-between py-4 px-5
                      cursor-pointer transition-colors duration-150
                      ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}
                    `}
                  >
                    {/* Candidate Name - Left Side */}
                    <span 
                      className={`
                        text-base
                        ${isSelected ? 'text-green-800 font-semibold' : 'text-gray-800'}
                      `}
                    >
                      {candidateName}
                    </span>

                    {/* Checkbox - Right Side */}
                    <div 
                      className={`
                        w-6 h-6 border-2 flex items-center justify-center
                        transition-all duration-150
                        ${isSelected 
                          ? 'border-green-600 bg-green-600' 
                          : 'border-gray-400 bg-white'
                        }
                      `}
                    >
                      {isSelected && (
                        <svg 
                          className="w-4 h-4 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Status */}
            <div 
              className={`
                px-4 py-3 flex items-center gap-2 border-t
                ${selectedId ? 'bg-green-50' : 'bg-orange-50'}
              `}
            >
              {selectedId ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm font-medium">
                    You have selected a candidate
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-orange-600 text-sm font-medium">
                    Please select a candidate
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
//last working code just to improve the design
// // src/components/Dashboard/Tabs/voting/PluralityBallot.jsx
// import React from 'react';
// import { AlertCircle, CheckCircle } from 'lucide-react';

// export default function PluralityBallot({ 
//   ballot,
//   answers = {},
//   onAnswersChange,
//   disabled = false,
//   /*eslint-disable*/
//   validationErrors = [],
//   electionId,
// }) {
//   const questions = ballot?.questions || [];

//   const selectCandidate = (questionId, candidateId) => {
//     if (disabled) return;
    
//     console.log('🗳️ CLICK! Question:', questionId, 'Candidate:', candidateId);
    
//     const newAnswers = {
//       ...answers,
//       [questionId]: candidateId,
//     };
    
//     console.log('🗳️ New answers:', newAnswers);
//     onAnswersChange(newAnswers);
//   };

//   if (!questions || questions.length === 0) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
//         <p className="text-yellow-800 font-semibold">No ballot questions available</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {questions.map((question, questionIndex) => {
//         const candidates = question?.options || [];
//         const questionId = question?.id;
//         const selectedId = answers[questionId];
//         const questionTitle = question?.question_text || question?.title || `Question ${questionIndex + 1}`;

//         return (
//           <div key={questionId || questionIndex} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
//             {/* Question Header */}
//             <div className="bg-gray-800 text-white py-4 px-6">
//               <div className="flex items-center gap-3">
//                 <span className="bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded">
//                   Q{questionIndex + 1}
//                 </span>
//                 <h3 className="text-lg font-bold">{questionTitle}</h3>
//               </div>
//             </div>

//             {/* Ballot Title */}
//             <div className="text-center py-4 border-b border-gray-300 bg-gray-50">
//               <h2 className="text-lg font-bold text-gray-800 italic">Official Ballot</h2>
//               <p className="text-sm text-gray-600 mt-1">Vote for <strong>ONE</strong> candidate only</p>
//             </div>

//             {/* Candidate List */}
//             <div className="p-4 space-y-3">
//               {candidates.map((candidate, index) => {
//                 const candidateId = candidate.id;
//                 const candidateName = candidate?.option_text || candidate?.name || `Candidate ${index + 1}`;
                
//                 const isSelected = selectedId !== undefined && 
//                                    selectedId !== null && 
//                                    (selectedId === candidateId || String(selectedId) === String(candidateId));

//                 return (
//                   <div
//                     key={candidateId || index}
//                     onClick={() => selectCandidate(questionId, candidateId)}
//                     className={`
//                       flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer
//                       transition-all duration-200 ease-in-out
//                       ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.01]'}
//                       ${isSelected 
//                         ? 'border-green-500 bg-green-50 shadow-md' 
//                         : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
//                       }
//                     `}
//                   >
//                     {/* Checkbox */}
//                     <div 
//                       className={`
//                         w-8 h-8 border-2 rounded flex items-center justify-center flex-shrink-0
//                         transition-all duration-200
//                         ${isSelected 
//                           ? 'border-green-500 bg-green-500' 
//                           : 'border-gray-400 bg-white'
//                         }
//                       `}
//                     >
//                       {isSelected && (
//                         <CheckCircle className="w-5 h-5 text-white" />
//                       )}
//                     </div>

//                     {/* Candidate Number */}
//                     <div 
//                       className={`
//                         w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
//                         ${isSelected 
//                           ? 'bg-green-600 text-white' 
//                           : 'bg-gray-200 text-gray-700'
//                         }
//                       `}
//                     >
//                       {index + 1}
//                     </div>

//                     {/* Candidate Name */}
//                     <div className="flex-1 min-w-0">
//                       <p className={`font-semibold text-base ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
//                         {candidateName}
//                       </p>
//                       {candidate?.description && (
//                         <p className="text-gray-500 text-sm mt-0.5 truncate">
//                           {candidate.description}
//                         </p>
//                       )}
//                     </div>

//                     {/* Selected Badge */}
//                     {isSelected && (
//                       <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
//                         ✓ SELECTED
//                       </span>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Selection Status */}
//             <div className={`border-t px-4 py-3 ${selectedId ? 'bg-green-50' : 'bg-orange-50'}`}>
//               {selectedId ? (
//                 <p className="text-green-700 text-sm font-medium flex items-center gap-2">
//                   <CheckCircle className="w-5 h-5" />
//                   ✓ You have selected a candidate
//                 </p>
//               ) : (
//                 <p className="text-orange-600 text-sm font-medium flex items-center gap-2">
//                   <AlertCircle className="w-5 h-5" />
//                   Please select a candidate
//                 </p>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }