// src/components/Dashboard/Tabs/voting/BallotRenderer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { AlertCircle, Loader } from 'lucide-react';
import PluralityBallot from './PluralityBallot';
import RankedChoiceBallot from './RankedChoiceBallot';
import ApprovalBallot from './ApprovalBallot';

export default function BallotRenderer({ 
  electionId,
  ballot,
  votingType,
  onAnswersChange,
  disabled = false,
}) {
  // ⭐ SAFE SELECTOR - will never crash even if votingNew is undefined
  const votingNewState = useSelector(state => state.votingNew);
  const answers = votingNewState?.answers || {};
  const validationErrors = votingNewState?.validationErrors || {};

  if (!votingType || votingType === '' || votingType === null) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-yellow-800 font-semibold mb-2">Voting Type Not Set</p>
        <p className="text-yellow-600 text-sm">
          Please contact the election administrator.
        </p>
      </div>
    );
  }

  if (!ballot || !ballot.questions) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Loading ballot...</p>
      </div>
    );
  }

  const normalizedVotingType = votingType.toLowerCase().trim();

  const renderBallot = () => {
    switch (normalizedVotingType) {
      case 'plurality':
      case 'single_choice':
      case 'single choice':
        return (
          <PluralityBallot
            ballot={ballot}
            answers={answers}
            onAnswersChange={onAnswersChange}
            disabled={disabled}
            validationErrors={validationErrors}
            electionId={electionId}
          />
        );

      case 'ranked_choice':
      case 'ranked':
      case 'ranked choice':
      case 'rcv':
        return (
          <RankedChoiceBallot
            ballot={ballot}
            answers={answers}
            onAnswersChange={onAnswersChange}
            disabled={disabled}
            validationErrors={validationErrors}
            electionId={electionId}
          />
        );

      case 'approval':
      case 'approval_voting':
      case 'approval voting':
        return (
          <ApprovalBallot
            ballot={ballot}
            answers={answers}
            onAnswersChange={onAnswersChange}
            disabled={disabled}
            validationErrors={validationErrors}
            electionId={electionId}
          />
        );

      default:
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-800 font-semibold mb-2">Unknown Voting Type</p>
            <p className="text-red-600 text-sm">
              "{votingType}" is not supported.
            </p>
          </div>
        );
    }
  };

  const getVotingTypeInfo = () => {
    switch (normalizedVotingType) {
      case 'plurality':
      case 'single_choice':
      case 'single choice':
        return { emoji: '🎯', name: 'Single Choice', description: 'Select ONE option per question' };
      case 'ranked_choice':
      case 'ranked':
      case 'ranked choice':
      case 'rcv':
        return { emoji: '📊', name: 'Ranked Choice', description: 'Rank options in order of preference' };
      case 'approval':
      case 'approval_voting':
      case 'approval voting':
        return { emoji: '✅', name: 'Approval Voting', description: 'Select ALL options you approve of' };
      default:
        return { emoji: '❓', name: votingType, description: 'Unknown voting method' };
    }
  };

  const votingTypeInfo = getVotingTypeInfo();

  return (
    <div className="space-y-6">
      {/* Voting Type Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {votingTypeInfo.emoji} {votingTypeInfo.name}
          </div>
          <p className="text-blue-800 text-sm">
            {votingTypeInfo.description}
          </p>
        </div>
      </div>

      {/* Render the appropriate ballot */}
      {renderBallot()}
    </div>
  );
}
//last workable code
// // src/components/Dashboard/Tabs/voting/BallotRenderer.jsx
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { AlertCircle, Loader } from 'lucide-react';
// import PluralityBallot from './PluralityBallot';
// import RankedChoiceBallot from './RankedChoiceBallot';
// import ApprovalBallot from './ApprovalBallot';

// export default function BallotRenderer({ 
//     /*eslint-disable*/
//   electionId,
//   ballot,
//   votingType,
//   onAnswersChange,
//   disabled = false,
// }) {
//   const { answers, validationErrors } = useSelector(state => state.votingNew);

//   // ✅ FIX: Handle null/undefined/empty voting type
//   if (!votingType || votingType === '' || votingType === null) {
//     return (
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
//         <p className="text-yellow-800 font-semibold mb-2">Voting Type Not Set</p>
//         <p className="text-yellow-600 text-sm mb-4">
//           The election creator hasn't configured the voting type yet.
//         </p>
//         <p className="text-yellow-700 text-xs">
//           Please contact the election administrator or try again later.
//         </p>
//       </div>
//     );
//   }

//   // ✅ FIX: Handle loading state
//   if (!ballot || !ballot.questions) {
//     return (
//       <div className="bg-white rounded-lg p-8 text-center">
//         <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//         <p className="text-gray-600 font-semibold">Loading ballot...</p>
//       </div>
//     );
//   }

//   // ✅ FIX: Normalize voting type
//   const normalizedVotingType = votingType.toLowerCase().trim();

//   const renderBallot = () => {
//     switch (normalizedVotingType) {
//       case 'plurality':
//       case 'single_choice':
//       case 'single choice':
//         return (
//           <PluralityBallot
//             ballot={ballot}
//             answers={answers}
//             onAnswersChange={onAnswersChange}
//             disabled={disabled}
//             validationErrors={validationErrors}
//           />
//         );

//       case 'ranked_choice':
//       case 'ranked':
//       case 'ranked choice':
//       case 'rcv':
//         return (
//           <RankedChoiceBallot
//             ballot={ballot}
//             answers={answers}
//             onAnswersChange={onAnswersChange}
//             disabled={disabled}
//             validationErrors={validationErrors}
//           />
//         );

//       case 'approval':
//       case 'approval_voting':
//       case 'approval voting':
//         return (
//           <ApprovalBallot
//             ballot={ballot}
//             answers={answers}
//             onAnswersChange={onAnswersChange}
//             disabled={disabled}
//             validationErrors={validationErrors}
//           />
//         );

//       default:
//         return (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//             <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//             <p className="text-red-800 font-semibold mb-2">Unknown Voting Type</p>
//             <p className="text-red-600 text-sm mb-4">
//               Voting type "<strong>{votingType}</strong>" is not supported.
//             </p>
//             <div className="bg-white rounded-lg p-4 mt-4">
//               <p className="text-gray-700 text-sm font-semibold mb-2">Supported types:</p>
//               <ul className="text-gray-600 text-sm space-y-1">
//                 <li>✓ <code className="bg-gray-100 px-2 py-1 rounded">plurality</code></li>
//                 <li>✓ <code className="bg-gray-100 px-2 py-1 rounded">ranked_choice</code></li>
//                 <li>✓ <code className="bg-gray-100 px-2 py-1 rounded">approval</code></li>
//               </ul>
//             </div>
//           </div>
//         );
//     }
//   };

//   const getVotingTypeInfo = () => {
//     switch (normalizedVotingType) {
//       case 'plurality':
//       case 'single_choice':
//       case 'single choice':
//         return { emoji: '🎯', name: 'Single Choice', description: 'Select ONE option per question' };
//       case 'ranked_choice':
//       case 'ranked':
//       case 'ranked choice':
//       case 'rcv':
//         return { emoji: '📊', name: 'Ranked Choice', description: 'Rank options in order of preference' };
//       case 'approval':
//       case 'approval_voting':
//       case 'approval voting':
//         return { emoji: '✅', name: 'Approval Voting', description: 'Select ALL options you approve of' };
//       default:
//         return { emoji: '❓', name: votingType, description: 'Unknown voting method' };
//     }
//   };

//   const votingTypeInfo = getVotingTypeInfo();

//   return (
//     <div className="space-y-6">
//       {/* Voting Type Indicator */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-center gap-3">
//           <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//             {votingTypeInfo.emoji} {votingTypeInfo.name}
//           </div>
//           <p className="text-blue-800 text-sm">
//             {votingTypeInfo.description}
//           </p>
//         </div>
//       </div>

//       {/* Render Ballot */}
//       {renderBallot()}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/voting/BallotRenderer.jsx
// // ✨ Dynamic Ballot Renderer - Renders correct ballot based on voting type
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { AlertCircle } from 'lucide-react';

// // Import ballot type components
// import PluralityBallot from './PluralityBallot';
// import RankedChoiceBallot from './RankedChoiceBallot';
// import ApprovalBallot from './ApprovalBallot';

// export default function BallotRenderer({ 
//     /*eslint-disable*/
//   electionId,
//   ballot,
//   votingType,
//   onAnswersChange,
//   disabled = false,
// }) {
//   const { answers, validationErrors } = useSelector(state => state.votingNew);

//   // Determine which ballot component to render
//   const renderBallot = () => {
//     switch (votingType?.toLowerCase()) {
//       case 'plurality':
//       case 'single_choice':
//         return (
//           <PluralityBallot
//             ballot={ballot}
//             answers={answers}
//             onAnswersChange={onAnswersChange}
//             disabled={disabled}
//             validationErrors={validationErrors}
//           />
//         );

//       case 'ranked_choice':
//       case 'ranked':
//         return (
//           <RankedChoiceBallot
//             ballot={ballot}
//             answers={answers}
//             onAnswersChange={onAnswersChange}
//             disabled={disabled}
//             validationErrors={validationErrors}
//           />
//         );

//       case 'approval':
//       case 'approval_voting':
//         return (
//           <ApprovalBallot
//             ballot={ballot}
//             answers={answers}
//             onAnswersChange={onAnswersChange}
//             disabled={disabled}
//             validationErrors={validationErrors}
//           />
//         );

//       default:
//         return (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//             <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//             <p className="text-red-800 font-semibold mb-2">Unknown Voting Type</p>
//             <p className="text-red-600 text-sm">
//               Voting type "{votingType}" is not supported.
//             </p>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Voting Type Indicator */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-center gap-3">
//           <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//             {votingType === 'plurality' && '🎯 Single Choice'}
//             {votingType === 'ranked_choice' && '📊 Ranked Choice'}
//             {votingType === 'approval' && '✅ Approval Voting'}
//           </div>
//           <p className="text-blue-800 text-sm">
//             {votingType === 'plurality' && 'Select ONE option per question'}
//             {votingType === 'ranked_choice' && 'Rank options in order of preference'}
//             {votingType === 'approval' && 'Select ALL options you approve of'}
//           </p>
//         </div>
//       </div>

//       {/* Render Ballot */}
//       {renderBallot()}
//     </div>
//   );
// }