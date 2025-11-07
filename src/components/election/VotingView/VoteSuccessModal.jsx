import React from 'react';
import { CheckCircle, Download, Ticket, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VoteSuccessModal({ 
  isOpen, 
  onClose, 
  voteData,
  electionTitle 
}) {
  const navigate = useNavigate();

  if (!isOpen || !voteData) return null;

  const downloadReceipt = () => {
    const receiptText = `
╔════════════════════════════════════════╗
║      VOTTERY - VOTE RECEIPT           ║
╚════════════════════════════════════════╝

Election: ${electionTitle}
Vote ID: ${voteData.voteId}
Receipt ID: ${voteData.receiptId}
Timestamp: ${new Date(voteData.timestamp).toLocaleString()}
${voteData.lotteryTicketNumber ? `Gamification Ticket: #${voteData.lotteryTicketNumber}` : ''}

Vote Hash: ${voteData.voteHash}

════════════════════════════════════════
This is your official vote receipt.
Keep it safe for verification.
You can verify your vote in "My Votes"
════════════════════════════════════════
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${voteData.receiptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGoToMyVotes = () => {
    console.log('🔄 Navigating to My Votes tab...');
    // First close the modal
    if (onClose) {
      onClose();
    }
    // Then navigate to dashboard with vote-history tab
    navigate('/dashboard?tab=vote-history', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleGoToMyVotes}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce-once">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Vote Submitted!</h2>
            <p className="text-gray-600">Your vote has been securely recorded</p>
          </div>
        </div>

        {/* Vote Details */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vote ID:</span>
                <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
                  {voteData.voteId}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receipt ID:</span>
                <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
                  {voteData.receiptId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Timestamp:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(voteData.timestamp).toLocaleString()}
                </span>
              </div>

              {voteData.lotteryTicketNumber && (
                <>
                  <div className="border-t-2 border-blue-200 my-3"></div>
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-yellow-300">
                    <div className="flex items-center gap-3">
                      <Ticket className="text-orange-600" size={32} />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 font-medium">Gamified Election Ticket Number</div>
                        <div className="text-3xl font-bold text-orange-600">
                          #{voteData.lotteryTicketNumber}
                        </div>
                      </div>
                      <Sparkles className="text-yellow-500" size={24} />
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-600 mt-2">
                    🎰 You're entered in the lottery! Winners announced at election end.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 py-3 rounded-lg">
            <Shield className="text-green-600" size={18} />
            <span className="font-medium">End-to-End Encrypted & Verified</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={downloadReceipt}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              <Download size={20} />
              Download Receipt
            </button>
            
            <button
              onClick={handleGoToMyVotes}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors font-semibold shadow-lg"
            >
              Go to My Votes →
            </button>
          </div>

          {/* Verification Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-700 text-center leading-relaxed">
              ℹ️ <strong>Important:</strong> You can verify your vote was counted using your Vote ID in the "My Votes" section. Your vote is encrypted and anonymized for privacy protection.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

function Sparkles({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
      <path d="M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5L19 3Z" fill="currentColor"/>
      <path d="M5 15L5.5 17.5L8 18L5.5 18.5L5 21L4.5 18.5L2 18L4.5 17.5L5 15Z" fill="currentColor"/>
    </svg>
  );
}
// import React from 'react';
// import { CheckCircle, Download, Ticket, Shield, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function VoteSuccessModal({ 
//   isOpen, 
//   onClose, 
//   voteData,
//   electionTitle 
// }) {
//   const navigate = useNavigate();

//   if (!isOpen || !voteData) return null;

//   const downloadReceipt = () => {
//     const receiptText = `
// ╔════════════════════════════════════════╗
// ║      VOTTERY - VOTE RECEIPT           ║
// ╚════════════════════════════════════════╝

// Election: ${electionTitle}
// Vote ID: ${voteData.voteId}
// Receipt ID: ${voteData.receiptId}
// Timestamp: ${new Date(voteData.timestamp).toLocaleString()}
// ${voteData.lotteryTicketNumber ? `Lottery Ticket: #${voteData.lotteryTicketNumber}` : ''}

// Vote Hash: ${voteData.voteHash}

// ════════════════════════════════════════
// This is your official vote receipt.
// Keep it safe for verification.
// You can verify your vote in "My Votes"
// ════════════════════════════════════════
//     `;

//     const blob = new Blob([receiptText], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `vote-receipt-${voteData.receiptId}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleGoToMyVotes = () => {
//     // Navigate to dashboard with vote-history tab active
//     navigate('/dashboard?tab=vote-history');
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
//         {/* Header */}
//         <div className="relative p-6 pb-4">
//           <button
//             onClick={handleGoToMyVotes}
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//           >
//             <X size={24} />
//           </button>
          
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce-once">
//               <CheckCircle className="text-green-600" size={48} />
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Vote Submitted!</h2>
//             <p className="text-gray-600">Your vote has been securely recorded</p>
//           </div>
//         </div>

//         {/* Vote Details */}
//         <div className="px-6 pb-6">
//           <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Vote ID:</span>
//                 <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
//                   {voteData.voteId}
//                 </span>
//               </div>
              
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Receipt ID:</span>
//                 <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
//                   {voteData.receiptId}
//                 </span>
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Timestamp:</span>
//                 <span className="text-sm font-semibold text-gray-900">
//                   {new Date(voteData.timestamp).toLocaleString()}
//                 </span>
//               </div>

//               {voteData.lotteryTicketNumber && (
//                 <>
//                   <div className="border-t-2 border-blue-200 my-3"></div>
//                   <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-yellow-300">
//                     <div className="flex items-center gap-3">
//                       <Ticket className="text-orange-600" size={32} />
//                       <div className="flex-1">
//                         <div className="text-xs text-gray-600 font-medium">Lottery Ticket Number</div>
//                         <div className="text-3xl font-bold text-orange-600">
//                           #{voteData.lotteryTicketNumber}
//                         </div>
//                       </div>
//                       <Sparkles className="text-yellow-500" size={24} />
//                     </div>
//                   </div>
//                   <p className="text-xs text-center text-gray-600 mt-2">
//                     🎰 You're entered in the lottery! Winners announced at election end.
//                   </p>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Security Badge */}
//           <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 py-3 rounded-lg">
//             <Shield className="text-green-600" size={18} />
//             <span className="font-medium">End-to-End Encrypted & Verified</span>
//           </div>

//           {/* Actions */}
//           <div className="space-y-3">
//             <button
//               onClick={downloadReceipt}
//               className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
//             >
//               <Download size={20} />
//               Download Receipt
//             </button>
            
//             <button
//               onClick={handleGoToMyVotes}
//               className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
//             >
//               Go to My Votes
//             </button>
//           </div>

//           {/* Verification Note */}
//           <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <p className="text-xs text-gray-700 text-center leading-relaxed">
//               ℹ️ <strong>Important:</strong> You can verify your vote was counted using your Vote ID in the "My Votes" section. Your vote is encrypted and anonymized for privacy protection.
//             </p>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes bounce-once {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-20px); }
//         }
//         .animate-bounce-once {
//           animation: bounce-once 0.6s ease-in-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// function Sparkles({ size, className }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
//       <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
//       <path d="M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5L19 3Z" fill="currentColor"/>
//       <path d="M5 15L5.5 17.5L8 18L5.5 18.5L5 21L4.5 18.5L2 18L4.5 17.5L5 15Z" fill="currentColor"/>
//     </svg>
//   );
// }
// import React from 'react';
// import { CheckCircle, Download, Ticket, Shield, X } from 'lucide-react';

// export default function VoteSuccessModal({ 
//   isOpen, 
//   onClose, 
//   voteData,
//   electionTitle 
// }) {
//   if (!isOpen || !voteData) return null;

//   const downloadReceipt = () => {
//     const receiptText = `
// ╔════════════════════════════════════════╗
// ║      VOTTERY - VOTE RECEIPT           ║
// ╚════════════════════════════════════════╝

// Election: ${electionTitle}
// Vote ID: ${voteData.voteId}
// Receipt ID: ${voteData.receiptId}
// Timestamp: ${new Date(voteData.timestamp).toLocaleString()}
// ${voteData.lotteryTicketNumber ? `Lottery Ticket: #${voteData.lotteryTicketNumber}` : ''}

// Vote Hash: ${voteData.voteHash}

// ════════════════════════════════════════
// This is your official vote receipt.
// Keep it safe for verification.
// You can verify your vote in "My Votes"
// ════════════════════════════════════════
//     `;

//     const blob = new Blob([receiptText], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `vote-receipt-${voteData.receiptId}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
//         {/* Header */}
//         <div className="relative p-6 pb-4">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//           >
//             <X size={24} />
//           </button>
          
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce-once">
//               <CheckCircle className="text-green-600" size={48} />
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Vote Submitted!</h2>
//             <p className="text-gray-600">Your vote has been securely recorded</p>
//           </div>
//         </div>

//         {/* Vote Details */}
//         <div className="px-6 pb-6">
//           <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Vote ID:</span>
//                 <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
//                   {voteData.voteId}
//                 </span>
//               </div>
              
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Receipt ID:</span>
//                 <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
//                   {voteData.receiptId}
//                 </span>
//               </div>

//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Timestamp:</span>
//                 <span className="text-sm font-semibold text-gray-900">
//                   {new Date(voteData.timestamp).toLocaleString()}
//                 </span>
//               </div>

//               {voteData.lotteryTicketNumber && (
//                 <>
//                   <div className="border-t-2 border-blue-200 my-3"></div>
//                   <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-2 border-yellow-300">
//                     <div className="flex items-center gap-3">
//                       <Ticket className="text-orange-600" size={32} />
//                       <div className="flex-1">
//                         <div className="text-xs text-gray-600 font-medium">Lottery Ticket Number</div>
//                         <div className="text-3xl font-bold text-orange-600">
//                           #{voteData.lotteryTicketNumber}
//                         </div>
//                       </div>
//                       <Sparkles className="text-yellow-500" size={24} />
//                     </div>
//                   </div>
//                   <p className="text-xs text-center text-gray-600 mt-2">
//                     🎰 You're entered in the lottery! Winners announced at election end.
//                   </p>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Security Badge */}
//           <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 py-3 rounded-lg">
//             <Shield className="text-green-600" size={18} />
//             <span className="font-medium">End-to-End Encrypted & Verified</span>
//           </div>

//           {/* Actions */}
//           <div className="space-y-3">
//             <button
//               onClick={downloadReceipt}
//               className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
//             >
//               <Download size={20} />
//               Download Receipt
//             </button>
            
//             <button
//               onClick={onClose}
//               className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
//             >
//               Go to My Votes
//             </button>
//           </div>

//           {/* Verification Note */}
//           <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <p className="text-xs text-gray-700 text-center leading-relaxed">
//               ℹ️ <strong>Important:</strong> You can verify your vote was counted using your Vote ID in the "My Votes" section. Your vote is encrypted and anonymized for privacy protection.
//             </p>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes bounce-once {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-20px); }
//         }
//         .animate-bounce-once {
//           animation: bounce-once 0.6s ease-in-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// function Sparkles({ size, className }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
//       <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
//       <path d="M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5L19 3Z" fill="currentColor"/>
//       <path d="M5 15L5.5 17.5L8 18L5.5 18.5L5 21L4.5 18.5L2 18L4.5 17.5L5 15Z" fill="currentColor"/>
//     </svg>
//   );
// }