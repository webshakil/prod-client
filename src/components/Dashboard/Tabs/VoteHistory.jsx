import React, { useState } from 'react';
import { 
  Vote, 
  Calendar, 
  CheckCircle, 
  Eye, 
  Download,
  Loader,
  Search,
  Ticket,
  DollarSign,
  Shield,
  UserCheck,
  Lock,
  Info
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useGetVotingHistoryQuery } from '../../../redux/api/voting/votingApi';
import { useVerifyByReceiptQuery } from '../../../redux/api/verification/verificationApi';

export default function VoteHistoryTab() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
  const [verifyingReceiptId, setVerifyingReceiptId] = useState(null);

  // 🔥 Fetch from backend API
  const { data: historyData, isLoading, error } = useGetVotingHistoryQuery(filters);
  
  // 🔥 Verification query - only runs when verifyingReceiptId is set
  const { data: verificationData, isLoading: isVerifying, error: verifyError } = useVerifyByReceiptQuery(
    verifyingReceiptId,
    { skip: !verifyingReceiptId }
  );
  
  const votes = historyData?.data?.votes || [];
  const pagination = historyData?.data?.pagination || {};

  const filteredVotes = votes.filter(vote => 
    vote.election_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle verification result
  React.useEffect(() => {
    if (verificationData && verifyingReceiptId) {
      const result = verificationData;
      alert(`✅ Vote Verified!\n\nReceipt ID: ${result.receipt.receiptId}\nVote Hash: ${result.receipt.voteHash}\nStatus: Verified\n\nThis vote is cryptographically secure and verified.`);
      setVerifyingReceiptId(null);
    }
    
    if (verifyError && verifyingReceiptId) {
      alert('❌ Verification failed. Please try again.');
      setVerifyingReceiptId(null);
    }
  }, [verificationData, verifyError, verifyingReceiptId]);

  const downloadReceipt = (vote) => {
    const receiptText = `
╔════════════════════════════════════════╗
║      VOTTERY - VOTE RECEIPT           ║
╚════════════════════════════════════════╝

Election: ${vote.election_title}
Vote Type: ${vote.is_anonymous_vote ? 'Anonymous (Identity Protected)' : 'Standard (Verified Identity)'}
Vote ID: ${vote.voting_id}
Receipt ID: ${vote.receipt_id}
Timestamp: ${new Date(vote.created_at).toLocaleString()}
${vote.lottery_ticket_number ? `Gamified Election Ticket Number: #${vote.lottery_ticket_number}` : ''}

Vote Hash: ${vote.vote_hash}

${vote.is_anonymous_vote ? `
🔒 ANONYMOUS VOTING
Your identity is completely protected and not linked to your vote.
Only you can verify this vote using your receipt ID.
` : `
✓ VERIFIED VOTING
Your identity was verified during voting.
You can verify this vote anytime using your receipt ID.
`}

════════════════════════════════════════
This is your official vote receipt.
Keep it safe for verification.
════════════════════════════════════════
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${vote.receipt_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verifyVote = (vote) => {
    setVerifyingReceiptId(vote.receipt_id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Failed to load voting history</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Vote History</h1>
          <p className="text-gray-600">Track all your voting activity - secured in database</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Votes</p>
              <p className="text-3xl font-bold text-gray-800">{pagination.total || votes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Vote className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Lottery Entries</p>
              <p className="text-3xl font-bold text-gray-800">
                {votes.filter(v => v.lottery_ticket_number).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Ticket className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-800">
                {votes.filter(v => {
                  const voteDate = new Date(v.created_at);
                  const now = new Date();
                  return voteDate.getMonth() === now.getMonth() && 
                         voteDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      {votes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by election name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Votes List */}
      <div className="space-y-4">
        {filteredVotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Vote size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Votes Yet</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No votes match your search.' : 'Start voting in elections to see your history here!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/dashboard?tab=vote-now')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse Elections
              </button>
            )}
          </div>
        ) : (
          filteredVotes.map((vote) => (
            <div 
              key={vote.id} 
              className={`bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 ${
                vote.is_anonymous_vote 
                  ? 'border-l-purple-500' 
                  : 'border-l-blue-500'
              }`}
            >
              <div className="p-6">
                {/* Header with Vote Type Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {vote.election_title}
                      </h3>
                      
                      {/* Vote Type Badge */}
                      {vote.is_anonymous_vote ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 rounded-full">
                          <Shield size={14} className="text-purple-700" />
                          <span className="text-xs font-bold text-purple-700">
                            ANONYMOUS
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-full">
                          <UserCheck size={14} className="text-blue-700" />
                          <span className="text-xs font-bold text-blue-700">
                            VERIFIED
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(vote.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={16} className="text-green-600" />
                        Vote ID: {vote.voting_id?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {vote.status || 'Valid'}
                  </div>
                </div>

                {/* Privacy Info Banner */}
                {vote.is_anonymous_vote ? (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Lock className="text-purple-600 mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                          🔒 Anonymous Vote - Identity Protected
                        </p>
                        <p className="text-sm text-purple-700">
                          Your identity is completely separated from your vote. Only you can verify this vote using your receipt ID. 
                          No one can link this vote back to you.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <UserCheck className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                          ✓ Verified Vote - Identity Confirmed
                        </p>
                        <p className="text-sm text-blue-700">
                          Your identity was verified during voting. This vote is linked to your verified account and can be audited if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Receipt Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-blue-600" />
                    <p className="text-sm font-semibold text-gray-700">Vote Receipt Information</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-semibold mb-1">Receipt ID</p>
                      <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200">
                        {vote.receipt_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold mb-1">Vote Hash (Cryptographic Proof)</p>
                      <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200">
                        {vote.vote_hash?.slice(0, 32)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lottery Info */}
                {vote.lottery_ticket_number && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {vote.ball_number || vote.lottery_ticket_number}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-900 flex items-center gap-2">
                          <Ticket size={16} />
                          Gamified Election Ticket #{vote.lottery_ticket_number}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Status: {vote.lottery_status || 'Pending Draw'} • Winners announced at election end
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                {vote.payment_amount && vote.payment_amount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-sm text-green-800">
                      Payment: {vote.payment_currency || 'USD'} {parseFloat(vote.payment_amount).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadReceipt(vote)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download size={20} />
                    Download Receipt
                  </button>
                  
                  <button
                    onClick={() => verifyVote(vote)}
                    disabled={isVerifying && verifyingReceiptId === vote.receipt_id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying && verifyingReceiptId === vote.receipt_id ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                    {isVerifying && verifyingReceiptId === vote.receipt_id ? 'Verifying...' : 'Verify Vote'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} votes
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
//LAST workable code just to differential anonymous and normal vote above code
// import React, { useState } from 'react';
// import { 
//   Vote, 
//   Calendar, 
//   CheckCircle, 
//   Eye, 
//   Download,
//   Loader,
//   Search,
//   Ticket,
//   DollarSign
// } from 'lucide-react';

// import { useNavigate } from 'react-router-dom';
// import { useGetVotingHistoryQuery } from '../../../redux/api/voting/votingApi';
// import { useVerifyByReceiptQuery } from '../../../redux/api/verification/verificationApi';

// export default function VoteHistoryTab() {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//   });
//   const [verifyingReceiptId, setVerifyingReceiptId] = useState(null);

//   // 🔥 Fetch from backend API
//   const { data: historyData, isLoading, error } = useGetVotingHistoryQuery(filters);
  
//   // 🔥 Verification query - only runs when verifyingReceiptId is set
//   const { data: verificationData, isLoading: isVerifying, error: verifyError } = useVerifyByReceiptQuery(
//     verifyingReceiptId,
//     { skip: !verifyingReceiptId }
//   );
  
//   const votes = historyData?.data?.votes || [];
//   const pagination = historyData?.data?.pagination || {};

//   const filteredVotes = votes.filter(vote => 
//     vote.election_title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Handle verification result
//   React.useEffect(() => {
//     if (verificationData && verifyingReceiptId) {
//       const result = verificationData;
//       alert(`✅ Vote Verified!\n\nReceipt ID: ${result.receipt.receiptId}\nVote Hash: ${result.receipt.voteHash}\nStatus: Verified\n\nThis vote is cryptographically secure and verified.`);
//       setVerifyingReceiptId(null);
//     }
    
//     if (verifyError && verifyingReceiptId) {
//       alert('❌ Verification failed. Please try again.');
//       setVerifyingReceiptId(null);
//     }
//   }, [verificationData, verifyError, verifyingReceiptId]);

//   const downloadReceipt = (vote) => {
//     const receiptText = `
// ╔════════════════════════════════════════╗
// ║      VOTTERY - VOTE RECEIPT           ║
// ╚════════════════════════════════════════╝

// Election: ${vote.election_title}
// Vote ID: ${vote.voting_id}
// Receipt ID: ${vote.receipt_id}
// Timestamp: ${new Date(vote.created_at).toLocaleString()}
// ${vote.lottery_ticket_number ? `Gamified Election Ticket Number: #${vote.lottery_ticket_number}` : ''}

// Vote Hash: ${vote.vote_hash}

// ════════════════════════════════════════
// This is your official vote receipt.
// Keep it safe for verification.
// ════════════════════════════════════════
//     `;

//     const blob = new Blob([receiptText], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `vote-receipt-${vote.receipt_id}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const verifyVote = (vote) => {
//     setVerifyingReceiptId(vote.receipt_id);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//         <p className="text-red-600">Failed to load voting history</p>
//         <button 
//           onClick={() => window.location.reload()}
//           className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">My Vote History</h1>
//           <p className="text-gray-600">Track all your voting activity - secured in database</p>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">Total Votes</p>
//               <p className="text-3xl font-bold text-gray-800">{pagination.total || votes.length}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//               <Vote className="text-blue-600" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">Lottery Entries</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {votes.filter(v => v.lottery_ticket_number).length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
//               <Ticket className="text-purple-600" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">This Month</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {votes.filter(v => {
//                   const voteDate = new Date(v.created_at);
//                   const now = new Date();
//                   return voteDate.getMonth() === now.getMonth() && 
//                          voteDate.getFullYear() === now.getFullYear();
//                 }).length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//               <Calendar className="text-green-600" size={24} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search */}
//       {votes.length > 0 && (
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="flex gap-4 items-center">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by election name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Votes List */}
//       <div className="space-y-4">
//         {filteredVotes.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <Vote size={64} className="mx-auto mb-4 text-gray-300" />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Votes Yet</h3>
//             <p className="text-gray-600 mb-6">
//               {searchTerm ? 'No votes match your search.' : 'Start voting in elections to see your history here!'}
//             </p>
//             {!searchTerm && (
//               <button
//                 onClick={() => navigate('/dashboard?tab=vote-now')}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 Browse Elections
//               </button>
//             )}
//           </div>
//         ) : (
//           filteredVotes.map((vote) => (
//             <div key={vote.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
//               <div className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-gray-800 mb-2">
//                       {vote.election_title}
//                     </h3>
//                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                       <span className="flex items-center gap-1">
//                         <Calendar size={16} />
//                         {new Date(vote.created_at).toLocaleDateString()}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <CheckCircle size={16} className="text-green-600" />
//                         Vote ID: {vote.voting_id?.slice(0, 8)}...
//                       </span>
//                     </div>
//                   </div>
//                   <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
//                     {vote.status || 'Valid'}
//                   </div>
//                 </div>

//                 {/* Receipt Info */}
//                 <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-600 font-semibold mb-1">Receipt ID</p>
//                       <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded">
//                         {vote.receipt_id}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 font-semibold mb-1">Vote Hash</p>
//                       <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded">
//                         {vote.vote_hash?.slice(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lottery Info */}
//                 {vote.lottery_ticket_number && (
//                   <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                         {vote.ball_number || vote.lottery_ticket_number}
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-sm font-bold text-orange-900 flex items-center gap-2">
//                           <Ticket size={16} />
//                           Gamified Election Ticket  #{vote.lottery_ticket_number}
//                         </p>
//                         <p className="text-xs text-orange-700 mt-1">
//                           Status: {vote.lottery_status || 'Pending Draw'} • Winners announced at election end
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Payment Info */}
//                 {vote.payment_amount && vote.payment_amount > 0 && (
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
//                     <DollarSign size={16} className="text-green-600" />
//                     <p className="text-sm text-green-800">
//                       Payment: {vote.payment_currency || 'USD'} {parseFloat(vote.payment_amount).toFixed(2)}
//                     </p>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => downloadReceipt(vote)}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                   >
//                     <Download size={20} />
//                     Download Receipt
//                   </button>
                  
//                   <button
//                     onClick={() => verifyVote(vote)}
//                     disabled={isVerifying && verifyingReceiptId === vote.receipt_id}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isVerifying && verifyingReceiptId === vote.receipt_id ? (
//                       <Loader className="animate-spin" size={20} />
//                     ) : (
//                       <Eye size={20} />
//                     )}
//                     {isVerifying && verifyingReceiptId === vote.receipt_id ? 'Verifying...' : 'Verify Vote'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600">
//             Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
//             {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} votes
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
//               disabled={pagination.currentPage === 1}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
//               disabled={pagination.currentPage === pagination.totalPages}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//last working code
// import React, { useState } from 'react';
// import { 
//   Vote, 
//   Calendar, 
//   CheckCircle, 
//   Eye, 
//   Download,
//   Loader,
//   Search,
//   Ticket,
//   DollarSign
// } from 'lucide-react';

// import { useNavigate } from 'react-router-dom';
// import { useGetVotingHistoryQuery } from '../../../redux/api/voting/votingApi';



// export default function VoteHistoryTab() {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//   });

//   // 🔥 Fetch from backend API
//   const { data: historyData, isLoading, error } = useGetVotingHistoryQuery(filters);
  
//   const votes = historyData?.data?.votes || [];
//   const pagination = historyData?.data?.pagination || {};

//   const filteredVotes = votes.filter(vote => 
//     vote.election_title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const downloadReceipt = (vote) => {
//     const receiptText = `
// ╔════════════════════════════════════════╗
// ║      VOTTERY - VOTE RECEIPT           ║
// ╚════════════════════════════════════════╝

// Election: ${vote.election_title}
// Vote ID: ${vote.voting_id}
// Receipt ID: ${vote.receipt_id}
// Timestamp: ${new Date(vote.created_at).toLocaleString()}
// ${vote.lottery_ticket_number ? `Gamified Election Ticket Numbser: #${vote.lottery_ticket_number}` : ''}

// Vote Hash: ${vote.vote_hash}

// ════════════════════════════════════════
// This is your official vote receipt.
// Keep it safe for verification.
// ════════════════════════════════════════
//     `;

//     const blob = new Blob([receiptText], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `vote-receipt-${vote.receipt_id}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const verifyVote = async (vote) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/verification/verify/${vote.receipt_id}`
//       );
      
//       if (!response.ok) {
//         throw new Error('Verification failed');
//       }

//       const result = await response.json();
      
//       alert(`✅ Vote Verified!\n\nReceipt ID: ${result.data.receipt_id}\nVote Hash: ${result.data.vote_hash}\nStatus: ${result.data.status}\n\nThis vote is cryptographically secure and verified.`);
//       /*eslint-disable*/
//     } catch (error) {
//       alert('❌ Verification failed. Please try again.');
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//         <p className="text-red-600">Failed to load voting history</p>
//         <button 
//           onClick={() => window.location.reload()}
//           className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">My Vote History</h1>
//           <p className="text-gray-600">Track all your voting activity - secured in database</p>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">Total Votes</p>
//               <p className="text-3xl font-bold text-gray-800">{pagination.total || votes.length}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//               <Vote className="text-blue-600" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">Lottery Entries</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {votes.filter(v => v.lottery_ticket_number).length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
//               <Ticket className="text-purple-600" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">This Month</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {votes.filter(v => {
//                   const voteDate = new Date(v.created_at);
//                   const now = new Date();
//                   return voteDate.getMonth() === now.getMonth() && 
//                          voteDate.getFullYear() === now.getFullYear();
//                 }).length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//               <Calendar className="text-green-600" size={24} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search */}
//       {votes.length > 0 && (
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="flex gap-4 items-center">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by election name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Votes List */}
//       <div className="space-y-4">
//         {filteredVotes.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <Vote size={64} className="mx-auto mb-4 text-gray-300" />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Votes Yet</h3>
//             <p className="text-gray-600 mb-6">
//               {searchTerm ? 'No votes match your search.' : 'Start voting in elections to see your history here!'}
//             </p>
//             {!searchTerm && (
//               <button
//                 onClick={() => navigate('/dashboard?tab=vote-now')}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 Browse Elections
//               </button>
//             )}
//           </div>
//         ) : (
//           filteredVotes.map((vote) => (
//             <div key={vote.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
//               <div className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-gray-800 mb-2">
//                       {vote.election_title}
//                     </h3>
//                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                       <span className="flex items-center gap-1">
//                         <Calendar size={16} />
//                         {new Date(vote.created_at).toLocaleDateString()}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <CheckCircle size={16} className="text-green-600" />
//                         Vote ID: {vote.voting_id?.slice(0, 8)}...
//                       </span>
//                     </div>
//                   </div>
//                   <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
//                     {vote.status || 'Valid'}
//                   </div>
//                 </div>

//                 {/* Receipt Info */}
//                 <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-600 font-semibold mb-1">Receipt ID</p>
//                       <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded">
//                         {vote.receipt_id}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 font-semibold mb-1">Vote Hash</p>
//                       <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded">
//                         {vote.vote_hash?.slice(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lottery Info */}
//                 {vote.lottery_ticket_number && (
//                   <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                         {vote.ball_number || vote.lottery_ticket_number}
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-sm font-bold text-orange-900 flex items-center gap-2">
//                           <Ticket size={16} />
//                           Gamified Election Ticket  #{vote.lottery_ticket_number}
//                         </p>
//                         <p className="text-xs text-orange-700 mt-1">
//                           Status: {vote.lottery_status || 'Pending Draw'} • Winners announced at election end
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Payment Info */}
//                 {vote.payment_amount && vote.payment_amount > 0 && (
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
//                     <DollarSign size={16} className="text-green-600" />
//                     <p className="text-sm text-green-800">
//                       Payment: {vote.payment_currency || 'USD'} {parseFloat(vote.payment_amount).toFixed(2)}
//                     </p>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => downloadReceipt(vote)}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                   >
//                     <Download size={20} />
//                     Download Receipt
//                   </button>
                  
//                   <button
//                     onClick={() => verifyVote(vote)}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
//                   >
//                     <Eye size={20} />
//                     Verify Vote
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600">
//             Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
//             {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} votes
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
//               disabled={pagination.currentPage === 1}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
//               disabled={pagination.currentPage === pagination.totalPages}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState } from 'react';
// import { 
//   Vote, 
//   Calendar, 
//   CheckCircle, 
//   Edit3, 
//   Eye, 
//   Download,
//   Loader,
//   Search,
//   Filter
// } from 'lucide-react';
// import { useGetVotingHistoryQuery } from '../../../redux/api/voting/votingApi';
// import { useNavigate } from 'react-router-dom';

// export default function VoteHistoryTab() {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//   });

//   const { data: historyData, isLoading } = useGetVotingHistoryQuery(filters);
//   const votes = historyData?.data?.votes || [];
//   const pagination = historyData?.data?.pagination || {};

//   const filteredVotes = votes.filter(vote => 
//     vote.election_title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getVoteStatusBadge = (status) => {
//     const styles = {
//       completed: 'bg-green-100 text-green-800',
//       edited: 'bg-blue-100 text-blue-800',
//       flagged: 'bg-red-100 text-red-800',
//       pending: 'bg-yellow-100 text-yellow-800',
//     };

//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
//         {status}
//       </span>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">My Vote History</h1>
//           <p className="text-gray-600">Track all your voting activity</p>
//         </div>
//         <button
//           onClick={() => {/* Export functionality */}}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <Download size={20} />
//           Export
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">Total Votes</p>
//               <p className="text-3xl font-bold text-gray-800">{votes.length}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//               <Vote className="text-blue-600" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">Edited Votes</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {votes.filter(v => v.vote_status === 'edited').length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
//               <Edit3 className="text-purple-600" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm mb-1">This Month</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {votes.filter(v => {
//                   const voteDate = new Date(v.created_at);
//                   const now = new Date();
//                   return voteDate.getMonth() === now.getMonth() && 
//                          voteDate.getFullYear() === now.getFullYear();
//                 }).length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//               <Calendar className="text-green-600" size={24} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex gap-4 items-center">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search by election name..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
//             <Filter size={20} />
//             Filter
//           </button>
//         </div>
//       </div>

//       {/* Votes List */}
//       <div className="space-y-4">
//         {filteredVotes.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <Vote size={64} className="mx-auto mb-4 text-gray-300" />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Votes Yet</h3>
//             <p className="text-gray-600 mb-6">
//               Start voting in elections to see your history here!
//             </p>
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//             >
//               Browse Elections
//             </button>
//           </div>
//         ) : (
//           filteredVotes.map((vote) => (
//             <div key={vote.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
//               <div className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-gray-800 mb-2">
//                       {vote.election_title}
//                     </h3>
//                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                       <span className="flex items-center gap-1">
//                         <Calendar size={16} />
//                         {new Date(vote.created_at).toLocaleDateString()}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <CheckCircle size={16} />
//                         Vote ID: {vote.voting_id?.slice(0, 8)}...
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {getVoteStatusBadge(vote.vote_status)}
//                   </div>
//                 </div>

//                 {/* Receipt Info */}
//                 <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-500 mb-1">Receipt ID</p>
//                       <p className="font-mono text-xs text-gray-800 break-all">
//                         {vote.receipt_id}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 mb-1">Vote Hash</p>
//                       <p className="font-mono text-xs text-gray-800 break-all">
//                         {vote.vote_hash?.slice(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lottery Info */}
//                 {vote.has_lottery_ticket && (
//                   <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
//                         {vote.lottery_ball_number}
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-purple-900">Lottery Entry Created</p>
//                         <p className="text-xs text-purple-600">
//                           Ball #{vote.lottery_ball_number} • {vote.lottery_status || 'Pending Draw'}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Edit History */}
//                 {vote.vote_status === 'edited' && vote.edit_count > 0 && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                     <p className="text-sm text-blue-800">
//                       <Edit3 size={14} className="inline mr-1" />
//                       This vote has been edited {vote.edit_count} time(s). 
//                       Last edited: {new Date(vote.updated_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => navigate(`/verify/${vote.receipt_id}`)}
//                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
//                   >
//                     <Eye size={20} />
//                     Verify Vote
//                   </button>
                  
//                   {vote.can_edit && (
//                     <button
//                       onClick={() => navigate(`/vote/${vote.election_slug}`)}
//                       className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                     >
//                       <Edit3 size={20} />
//                       Edit Vote
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
//           <p className="text-sm text-gray-600">
//             Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
//             {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} votes
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
//               disabled={pagination.currentPage === 1}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
//               disabled={pagination.currentPage === pagination.totalPages}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }