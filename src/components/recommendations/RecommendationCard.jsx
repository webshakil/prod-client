// src/components/recommendations/RecommendationCard.jsx
// ✅ Election Card for AI Recommendations with clear source indication
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Vote, 
  Calendar, 
  Users, 
  DollarSign, 
  Trophy, 
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import AIBadge, { NonAIBadge } from './AIBadge';

/**
 * 🎯 Recommendation Election Card
 * Displays an election with clear AI/non-AI source indication
 */
const RecommendationCard = ({ 
  election,
  isAIPowered = true,
  /*eslint-disable*/
  recommendationSource = 'shaped_ai',
  variant = 'default', // 'default' | 'compact' | 'featured'
  showAIBadge = true,
  onClick,
  className = '',
}) => {
  const navigate = useNavigate();

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get election status
  const getStatus = () => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    if (now < startDate) return { label: 'Upcoming', color: 'yellow', icon: Clock };
    if (now > endDate) return { label: 'Ended', color: 'gray', icon: null };
    return { label: 'Active', color: 'green', icon: Vote };
  };

  const status = getStatus();
  const isLottery = election.lottery_enabled === 'true' || election.lottery_enabled === true || election.lottery_config?.is_lotterized;
  const prizePool = election.lottery_prize_pool || election.lottery_config?.reward_amount;

  // Handle card click
  const handleClick = () => {
    // ✅ FIXED: Use election_id if available (from Shaped AI), otherwise fall back to id
    const electionId = election.election_id || election.id;
    if (onClick) {
      onClick({ ...election, id: electionId });
    } else {
      navigate(`/elections/${electionId}/vote`);
    }
  };

  // Compact variant for horizontal scroll
  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className={`
          relative flex-shrink-0 w-72
          bg-white rounded-xl
          border border-gray-100
          shadow-md hover:shadow-xl
          transition-all duration-300
          cursor-pointer
          overflow-hidden
          group
          ${className}
        `}
      >
        {/* AI Indicator Strip */}
        {isAIPowered && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        )}

        {/* Content */}
        <div className="p-4">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-purple-700 transition-colors">
                {election.title}
              </h3>
            </div>
            {showAIBadge && isAIPowered && (
              <AIBadge variant="compact" />
            )}
          </div>

          {/* Status & Lottery badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`
              px-2 py-0.5 text-[10px] font-semibold rounded-full
              ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
              ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${status.color === 'gray' ? 'bg-gray-100 text-gray-600' : ''}
            `}>
              {status.label}
            </span>
            
            {isLottery && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                <Trophy size={10} />
                Lottery
              </span>
            )}
          </div>

          {/* Prize pool if lottery */}
          {isLottery && prizePool && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 mb-3">
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-700">
                  ${Number(prizePool).toLocaleString()} Prize
                </span>
              </div>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(election.end_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{election.vote_count || 0} votes</span>
            </div>
          </div>

          {/* AI Source indicator */}
          {isAIPowered && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-[10px] text-purple-600">
                <Sparkles size={10} />
                <span className="font-medium">Recommended for you</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  }

  // Featured variant (larger, more prominent)
  if (variant === 'featured') {
    return (
      <div 
        onClick={handleClick}
        className={`
          relative
          bg-gradient-to-br from-white via-white to-purple-50
          rounded-2xl
          border border-purple-100
          shadow-lg hover:shadow-2xl
          transition-all duration-300
          cursor-pointer
          overflow-hidden
          group
          ${className}
        `}
      >
        {/* AI Glow border */}
        {isAIPowered && (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
        )}

        <div className="relative p-6">
          {/* Top row with badges */}
          <div className="flex items-center justify-between mb-4">
            {showAIBadge && isAIPowered && (
              <AIBadge variant="full" source="Shaped AI" />
            )}
            <span className={`
              px-3 py-1 text-xs font-bold rounded-full
              ${status.color === 'green' ? 'bg-green-500 text-white' : ''}
              ${status.color === 'yellow' ? 'bg-yellow-500 text-white' : ''}
              ${status.color === 'gray' ? 'bg-gray-400 text-white' : ''}
            `}>
              {status.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
            {election.title}
          </h3>

          {/* Description */}
          {election.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {election.description}
            </p>
          )}

          {/* Lottery highlight */}
          {isLottery && prizePool && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 mb-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80 mb-1">🎰 Lottery Prize Pool</p>
                  <p className="text-2xl font-black">${Number(prizePool).toLocaleString()}</p>
                </div>
                <Trophy size={32} className="opacity-50" />
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Calendar size={16} className="mx-auto mb-1 text-gray-400" />
              <p className="text-[10px] text-gray-500">Ends</p>
              <p className="text-xs font-bold text-gray-700">{formatDate(election.end_date)}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Users size={16} className="mx-auto mb-1 text-gray-400" />
              <p className="text-[10px] text-gray-500">Votes</p>
              <p className="text-xs font-bold text-gray-700">{election.vote_count || 0}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <DollarSign size={16} className="mx-auto mb-1 text-gray-400" />
              <p className="text-[10px] text-gray-500">Fee</p>
              <p className="text-xs font-bold text-gray-700">
                {election.is_free ? 'Free' : `$${election.participation_fee || 0}`}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:from-purple-700 group-hover:to-indigo-700 transition-all">
            <Vote size={18} />
            <span>Vote Now</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      onClick={handleClick}
      className={`
        relative
        bg-white rounded-xl
        border border-gray-100
        shadow-md hover:shadow-lg
        transition-all duration-200
        cursor-pointer
        overflow-hidden
        group
        ${className}
      `}
    >
      {/* AI indicator line */}
      {isAIPowered && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
              {election.title}
            </h3>
            {election.description && (
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {election.description}
              </p>
            )}
          </div>
          {showAIBadge && (
            isAIPowered ? <AIBadge variant="compact" /> : <NonAIBadge variant="compact" />
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`
            px-2.5 py-1 text-xs font-semibold rounded-full
            ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
            ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${status.color === 'gray' ? 'bg-gray-100 text-gray-600' : ''}
          `}>
            {status.label}
          </span>
          
          {isLottery && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
              🎰 Lottery
            </span>
          )}
          
          {!election.is_free && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
              💰 Paid
            </span>
          )}
        </div>

        {/* Lottery prize highlight */}
        {isLottery && prizePool && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-purple-600" />
              <div>
                <p className="text-[10px] text-purple-600 font-medium">Prize Pool</p>
                <p className="text-lg font-black text-purple-700">
                  ${Number(prizePool).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(election.end_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{election.vote_count || 0} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} />
            <span>{election.is_free ? 'Free' : `$${election.participation_fee || 0}`}</span>
          </div>
        </div>

        {/* AI source footer */}
        {isAIPowered && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-purple-600">
              <Sparkles size={12} />
              <span className="font-medium">AI Recommended</span>
            </div>
            <TrendingUp size={14} className="text-purple-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
// // src/components/recommendations/RecommendationCard.jsx
// // ✅ Election Card for AI Recommendations with clear source indication
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Vote, 
//   Calendar, 
//   Users, 
//   DollarSign, 
//   Trophy, 
//   Clock,
//   ArrowRight,
//   Sparkles,
//   TrendingUp,
// } from 'lucide-react';
// import AIBadge, { NonAIBadge } from './AIBadge';

// /**
//  * 🎯 Recommendation Election Card
//  * Displays an election with clear AI/non-AI source indication
//  */
// const RecommendationCard = ({ 
//   election,
//   isAIPowered = true,
//   /*eslint-disable*/
//   recommendationSource = 'shaped_ai',
//   variant = 'default', // 'default' | 'compact' | 'featured'
//   showAIBadge = true,
//   onClick,
//   className = '',
// }) => {
//   const navigate = useNavigate();

//   // Format date helper
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   // Get election status
//   const getStatus = () => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     if (now < startDate) return { label: 'Upcoming', color: 'yellow', icon: Clock };
//     if (now > endDate) return { label: 'Ended', color: 'gray', icon: null };
//     return { label: 'Active', color: 'green', icon: Vote };
//   };

//   const status = getStatus();
//   const isLottery = election.lottery_enabled === 'true' || election.lottery_enabled === true || election.lottery_config?.is_lotterized;
//   const prizePool = election.lottery_prize_pool || election.lottery_config?.reward_amount;

//   // Handle card click
//   const handleClick = () => {
//     if (onClick) {
//       onClick(election);
//     } else {
//       navigate(`/elections/${election.id}/vote`);
//     }
//   };

//   // Compact variant for horizontal scroll
//   if (variant === 'compact') {
//     return (
//       <div 
//         onClick={handleClick}
//         className={`
//           relative flex-shrink-0 w-72
//           bg-white rounded-xl
//           border border-gray-100
//           shadow-md hover:shadow-xl
//           transition-all duration-300
//           cursor-pointer
//           overflow-hidden
//           group
//           ${className}
//         `}
//       >
//         {/* AI Indicator Strip */}
//         {isAIPowered && (
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
//         )}

//         {/* Content */}
//         <div className="p-4">
//           {/* Header with badges */}
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex-1 pr-2">
//               <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-purple-700 transition-colors">
//                 {election.title}
//               </h3>
//             </div>
//             {showAIBadge && isAIPowered && (
//               <AIBadge variant="compact" />
//             )}
//           </div>

//           {/* Status & Lottery badges */}
//           <div className="flex flex-wrap gap-1.5 mb-3">
//             <span className={`
//               px-2 py-0.5 text-[10px] font-semibold rounded-full
//               ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
//               ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
//               ${status.color === 'gray' ? 'bg-gray-100 text-gray-600' : ''}
//             `}>
//               {status.label}
//             </span>
            
//             {isLottery && (
//               <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
//                 <Trophy size={10} />
//                 Lottery
//               </span>
//             )}
//           </div>

//           {/* Prize pool if lottery */}
//           {isLottery && prizePool && (
//             <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 mb-3">
//               <div className="flex items-center gap-1.5">
//                 <DollarSign size={14} className="text-purple-600" />
//                 <span className="text-xs font-bold text-purple-700">
//                   ${Number(prizePool).toLocaleString()} Prize
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Meta info */}
//           <div className="flex items-center justify-between text-[11px] text-gray-500">
//             <div className="flex items-center gap-1">
//               <Calendar size={12} />
//               <span>{formatDate(election.end_date)}</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Users size={12} />
//               <span>{election.vote_count || 0} votes</span>
//             </div>
//           </div>

//           {/* AI Source indicator */}
//           {isAIPowered && (
//             <div className="mt-3 pt-2 border-t border-gray-100">
//               <div className="flex items-center gap-1.5 text-[10px] text-purple-600">
//                 <Sparkles size={10} />
//                 <span className="font-medium">Recommended for you</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Hover overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
//       </div>
//     );
//   }

//   // Featured variant (larger, more prominent)
//   if (variant === 'featured') {
//     return (
//       <div 
//         onClick={handleClick}
//         className={`
//           relative
//           bg-gradient-to-br from-white via-white to-purple-50
//           rounded-2xl
//           border border-purple-100
//           shadow-lg hover:shadow-2xl
//           transition-all duration-300
//           cursor-pointer
//           overflow-hidden
//           group
//           ${className}
//         `}
//       >
//         {/* AI Glow border */}
//         {isAIPowered && (
//           <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
//         )}

//         <div className="relative p-6">
//           {/* Top row with badges */}
//           <div className="flex items-center justify-between mb-4">
//             {showAIBadge && isAIPowered && (
//               <AIBadge variant="full" source="Shaped AI" />
//             )}
//             <span className={`
//               px-3 py-1 text-xs font-bold rounded-full
//               ${status.color === 'green' ? 'bg-green-500 text-white' : ''}
//               ${status.color === 'yellow' ? 'bg-yellow-500 text-white' : ''}
//               ${status.color === 'gray' ? 'bg-gray-400 text-white' : ''}
//             `}>
//               {status.label}
//             </span>
//           </div>

//           {/* Title */}
//           <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
//             {election.title}
//           </h3>

//           {/* Description */}
//           {election.description && (
//             <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//               {election.description}
//             </p>
//           )}

//           {/* Lottery highlight */}
//           {isLottery && prizePool && (
//             <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 mb-4 text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs opacity-80 mb-1">🎰 Lottery Prize Pool</p>
//                   <p className="text-2xl font-black">${Number(prizePool).toLocaleString()}</p>
//                 </div>
//                 <Trophy size={32} className="opacity-50" />
//               </div>
//             </div>
//           )}

//           {/* Stats row */}
//           <div className="grid grid-cols-3 gap-3 mb-4">
//             <div className="text-center p-2 bg-gray-50 rounded-lg">
//               <Calendar size={16} className="mx-auto mb-1 text-gray-400" />
//               <p className="text-[10px] text-gray-500">Ends</p>
//               <p className="text-xs font-bold text-gray-700">{formatDate(election.end_date)}</p>
//             </div>
//             <div className="text-center p-2 bg-gray-50 rounded-lg">
//               <Users size={16} className="mx-auto mb-1 text-gray-400" />
//               <p className="text-[10px] text-gray-500">Votes</p>
//               <p className="text-xs font-bold text-gray-700">{election.vote_count || 0}</p>
//             </div>
//             <div className="text-center p-2 bg-gray-50 rounded-lg">
//               <DollarSign size={16} className="mx-auto mb-1 text-gray-400" />
//               <p className="text-[10px] text-gray-500">Fee</p>
//               <p className="text-xs font-bold text-gray-700">
//                 {election.is_free ? 'Free' : `$${election.participation_fee || 0}`}
//               </p>
//             </div>
//           </div>

//           {/* CTA Button */}
//           <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:from-purple-700 group-hover:to-indigo-700 transition-all">
//             <Vote size={18} />
//             <span>Vote Now</span>
//             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Default variant
//   return (
//     <div 
//       onClick={handleClick}
//       className={`
//         relative
//         bg-white rounded-xl
//         border border-gray-100
//         shadow-md hover:shadow-lg
//         transition-all duration-200
//         cursor-pointer
//         overflow-hidden
//         group
//         ${className}
//       `}
//     >
//       {/* AI indicator line */}
//       {isAIPowered && (
//         <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
//       )}

//       <div className="p-5">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex-1">
//             <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
//               {election.title}
//             </h3>
//             {election.description && (
//               <p className="text-gray-500 text-sm mt-1 line-clamp-2">
//                 {election.description}
//               </p>
//             )}
//           </div>
//           {showAIBadge && (
//             isAIPowered ? <AIBadge variant="compact" /> : <NonAIBadge variant="compact" />
//           )}
//         </div>

//         {/* Badges row */}
//         <div className="flex flex-wrap gap-2 mb-4">
//           <span className={`
//             px-2.5 py-1 text-xs font-semibold rounded-full
//             ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
//             ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
//             ${status.color === 'gray' ? 'bg-gray-100 text-gray-600' : ''}
//           `}>
//             {status.label}
//           </span>
          
//           {isLottery && (
//             <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
//               🎰 Lottery
//             </span>
//           )}
          
//           {!election.is_free && (
//             <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
//               💰 Paid
//             </span>
//           )}
//         </div>

//         {/* Lottery prize highlight */}
//         {isLottery && prizePool && (
//           <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-3 mb-4">
//             <div className="flex items-center gap-2">
//               <Trophy size={18} className="text-purple-600" />
//               <div>
//                 <p className="text-[10px] text-purple-600 font-medium">Prize Pool</p>
//                 <p className="text-lg font-black text-purple-700">
//                   ${Number(prizePool).toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Meta row */}
//         <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
//           <div className="flex items-center gap-1">
//             <Calendar size={14} />
//             <span>{formatDate(election.end_date)}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Users size={14} />
//             <span>{election.vote_count || 0} votes</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <DollarSign size={14} />
//             <span>{election.is_free ? 'Free' : `$${election.participation_fee || 0}`}</span>
//           </div>
//         </div>

//         {/* AI source footer */}
//         {isAIPowered && (
//           <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
//             <div className="flex items-center gap-1.5 text-xs text-purple-600">
//               <Sparkles size={12} />
//               <span className="font-medium">AI Recommended</span>
//             </div>
//             <TrendingUp size={14} className="text-purple-400" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RecommendationCard;