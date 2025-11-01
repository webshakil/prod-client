import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Download, Home, ArrowLeft, Receipt, Calendar, DollarSign, Info } from 'lucide-react';

export default function VoteConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { electionId } = useParams();

  // Get data from navigation state
  const { 
    voteData, 
    paymentData, 
    electionTitle, 
    receiptId 
  } = location.state || {};

  // Redirect if no data
  useEffect(() => {
    if (!voteData || !electionTitle) {
      console.warn('No vote data found, redirecting...');
      navigate('/dashboard');
    }
  }, [voteData, electionTitle, navigate]);

  if (!voteData || !electionTitle) {
    return null; // Will redirect via useEffect
  }

  // Safe access to payment data with defaults
  const hasPayment = paymentData && paymentData.total > 0;
  const currency = paymentData?.currency || 'USD';
  const total = paymentData?.total || 0;
  const participationFee = paymentData?.participationFee || 0;
  const processingFee = paymentData?.processingFee || 0;
  const frozenAmount = paymentData?.frozenAmount || 0;
  const region = paymentData?.region || '';

  const formatCurrency = (amount) => {
    const safeAmount = parseFloat(amount || 0);
    return `${currency} ${safeAmount.toFixed(2)}`;
  };

  const handleDownloadReceipt = () => {
    // Generate receipt content
    const receiptContent = `
VOTE RECEIPT
============================================
Receipt ID: ${receiptId || 'N/A'}
Date: ${new Date().toLocaleString()}

ELECTION DETAILS
--------------------------------------------
Title: ${electionTitle}
Election ID: ${electionId}

${hasPayment ? `
PAYMENT DETAILS
--------------------------------------------
Total Payment: ${formatCurrency(total)}
Participation Fee: ${formatCurrency(participationFee)}
Processing Fee: ${formatCurrency(processingFee)}
Frozen Amount: ${formatCurrency(frozenAmount)}
${region ? `Region: ${region}` : ''}

PAYMENT STATUS
--------------------------------------------
✓ Payment Successful
✓ Processing fee deducted
✓ Participation fee frozen until election ends
` : `
PAYMENT DETAILS
--------------------------------------------
Type: Free Election
Amount: ${formatCurrency(0)}
`}

VOTE DETAILS
--------------------------------------------
Number of Questions Answered: ${voteData.answers?.length || 0}
Vote Status: Confirmed

============================================
Thank you for participating!
Visit: ${window.location.origin}
============================================
    `.trim();

    // Create blob and download
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${receiptId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg">
              <CheckCircle className="text-green-600" size={64} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Vote Submitted Successfully!
            </h1>
            <p className="text-green-100 text-lg">
              Thank you for participating in the election
            </p>
          </div>

          {/* Election Info */}
          <div className="p-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{electionTitle}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Receipt className="text-blue-600" size={24} />
                <div>
                  <p className="text-xs text-gray-600">Receipt ID</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm">
                    {receiptId || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <p className="text-xs text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {hasPayment ? (
            <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="text-blue-600" size={28} />
                <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>
              </div>

              <div className="space-y-3 mb-6">
                {region && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-semibold text-gray-900">{region}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Participation Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(participationFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(processingFee)}
                  </span>
                </div>

                <div className="border-t-2 border-blue-300 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Paid:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Payment Status Info */}
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-blue-900 mb-2">Payment Status:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        <span>Processing fee ({formatCurrency(processingFee)}) has been deducted</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        <span>Participation fee ({formatCurrency(frozenAmount)}) is frozen in your wallet</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="text-blue-600" size={16} />
                        <span>Frozen amount will be held until election ends</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="text-purple-600" size={16} />
                        <span>After election, frozen amount will be used for prize distribution</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={28} />
                <h3 className="text-xl font-bold text-gray-900">Free Election</h3>
              </div>
              <p className="text-gray-700">
                This was a free election. No payment was required.
              </p>
            </div>
          )}

          {/* Vote Summary */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Vote Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-semibold text-gray-900">
                  {voteData.answers?.length || 0} question{voteData.answers?.length !== 1 ? 's' : ''} answered
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Your vote has been recorded and cannot be changed. You will be notified when the election results are announced.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 bg-gray-50 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Download size={20} />
              Download Receipt
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              <Home size={20} />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You will receive a confirmation email with your receipt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Your vote is securely stored and cannot be changed</span>
            </li>
            {hasPayment && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Your frozen amount will remain in your wallet until the election ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>After election ends, prizes will be distributed from the frozen pool</span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Results will be announced when the election closes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can view your voting history in your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/vote')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} />
            View Other Elections
          </button>
        </div>
      </div>
    </div>
  );
}
// import React from 'react';
// import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import { CheckCircle, Trophy, Wallet, ArrowRight, Eye, Download, Share2 } from 'lucide-react';

// export default function VoteConfirmationPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { electionId } = useParams();
  
//   // Get data passed from voting page
//   const { 
//     /*eslint-disable*/
//     voteData, 
//     paymentData, 
//     lotteryEntry,
//     electionTitle,
//     receiptId 
//   } = location.state || {};

//   const handleViewResults = () => {
//     navigate(`/elections/${electionId}/results`);
//   };

//   const handleDownloadReceipt = () => {
//     // TODO: Implement receipt download
//     console.log('Download receipt:', receiptId);
//   };

//   const handleShareVote = () => {
//     // TODO: Implement social sharing
//     console.log('Share vote');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
//       <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
//         {/* Success Header */}
//         <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
//           <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full mb-4">
//             <CheckCircle className="w-16 h-16" />
//           </div>
//           <h1 className="text-3xl font-bold mb-2">
//             Vote Submitted Successfully!
//           </h1>
//           <p className="text-green-100">
//             Your vote has been securely recorded and encrypted
//           </p>
//         </div>

//         {/* Content */}
//         <div className="p-8">
//           {/* Election Info */}
//           {electionTitle && (
//             <div className="bg-blue-50 rounded-lg p-4 mb-6">
//               <p className="text-sm text-blue-600 mb-1">Election</p>
//               <h2 className="text-xl font-bold text-blue-900">{electionTitle}</h2>
//             </div>
//           )}

//           {/* Vote Receipt */}
//           {receiptId && (
//             <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6">
//               <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <Eye size={20} />
//                 Vote Receipt
//               </h3>
//               <div className="bg-white rounded p-4">
//                 <p className="text-xs text-gray-500 mb-1">Receipt ID</p>
//                 <p className="text-lg font-mono font-bold text-gray-900 mb-3">
//                   {receiptId}
//                 </p>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Keep this receipt to verify your vote was counted. You can use this to check your vote on the public bulletin board.
//                 </p>
//                 <div className="flex gap-3">
//                   <button
//                     onClick={handleDownloadReceipt}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     <Download size={16} />
//                     Download Receipt
//                   </button>
//                   <button
//                     onClick={() => navigate(`/verify/${receiptId}`)}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
//                   >
//                     <Eye size={16} />
//                     Verify Vote
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Payment Info */}
//           {paymentData && (
//             <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 p-3 bg-yellow-200 rounded-full">
//                   <Wallet className="text-yellow-700" size={24} />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-bold text-gray-900 mb-2">Payment Processed</h3>
//                   <div className="bg-white rounded-lg p-4 mb-3">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-600">Amount Paid:</span>
//                       <span className="text-2xl font-bold text-gray-900">
//                         {paymentData.currency} {paymentData.total.toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="text-sm text-gray-600 space-y-1">
//                       <div className="flex justify-between">
//                         <span>Participation Fee:</span>
//                         <span>{paymentData.currency} {paymentData.amount.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Processing Fee:</span>
//                         <span>{paymentData.currency} {paymentData.processing.toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex items-start gap-2">
//                       <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
//                       <p className="text-gray-700">
//                         <strong>Funds Frozen:</strong> Your payment is securely held in your wallet
//                       </p>
//                     </div>
//                     <div className="flex items-start gap-2">
//                       <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
//                       <p className="text-gray-700">
//                         <strong>Release Date:</strong> After election completion
//                       </p>
//                     </div>
//                     <div className="flex items-start gap-2">
//                       <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
//                       <p className="text-gray-700">
//                         <strong>Refund Policy:</strong> Full refund if election is cancelled
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Lottery Entry */}
//           {lotteryEntry && (
//             <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 p-3 bg-purple-200 rounded-full">
//                   <Trophy className="text-purple-700" size={24} />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//                     <span className="text-2xl">🎰</span>
//                     Lottery Entry Confirmed!
//                   </h3>
//                   <p className="text-gray-700 mb-4">
//                     Congratulations! You've been automatically entered into the lottery draw
//                   </p>
//                   <div className="bg-white rounded-lg p-4 mb-3">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-xs text-gray-500 mb-1">Your Entry Number</p>
//                         <p className="text-xl font-bold text-purple-900 font-mono">
//                           #{lotteryEntry.entryNumber}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500 mb-1">Total Entries</p>
//                         <p className="text-xl font-bold text-purple-900">
//                           {lotteryEntry.totalEntries || '---'}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="bg-purple-100 rounded p-3 text-sm text-purple-900">
//                     <p className="font-semibold mb-1">🏆 Prize Pool Information</p>
//                     <p>{lotteryEntry.prizeDescription || 'Prize details will be announced soon'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* What's Next */}
//           <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-6">
//             <h3 className="font-bold text-blue-900 mb-3">What Happens Next?</h3>
//             <ul className="space-y-2 text-sm text-blue-800">
//               <li className="flex items-start gap-2">
//                 <span className="text-blue-600 font-bold">1.</span>
//                 <span>Your vote is encrypted and stored securely on our blockchain-backed system</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-blue-600 font-bold">2.</span>
//                 <span>You can verify your vote was counted using your receipt ID</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-blue-600 font-bold">3.</span>
//                 <span>Live results will be updated if the election creator has enabled them</span>
//               </li>
//               {paymentData && (
//                 <li className="flex items-start gap-2">
//                   <span className="text-blue-600 font-bold">4.</span>
//                   <span>Your payment will be released to your wallet after the election ends</span>
//                 </li>
//               )}
//               {lotteryEntry && (
//                 <li className="flex items-start gap-2">
//                   <span className="text-blue-600 font-bold">5.</span>
//                   <span>Lottery winners will be announced when the election closes</span>
//                 </li>
//               )}
//             </ul>
//           </div>

//           {/* Action Buttons */}
//           <div className="space-y-3">
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => navigate('/vote')}
//                 className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
//               >
//                 Browse Elections
//               </button>
//               <button
//                 onClick={() => navigate('/dashboard/wallet')}
//                 className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors flex items-center justify-center gap-2"
//               >
//                 <Wallet size={20} />
//                 View Wallet
//               </button>
//             </div>
            
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
//             >
//               Go to Dashboard
//               <ArrowRight size={20} />
//             </button>

//             {/* Share Button */}
//             <button
//               onClick={handleShareVote}
//               className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors flex items-center justify-center gap-2"
//             >
//               <Share2 size={20} />
//               Share Your Participation
//             </button>
//           </div>

//           {/* Security Note */}
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
//             <p className="text-xs text-gray-500">
//               🔒 Your vote is anonymous and encrypted. Your identity is separated from your vote choices.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }