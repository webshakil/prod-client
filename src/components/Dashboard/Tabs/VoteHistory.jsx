import React, { useState, useEffect } from 'react';
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
  Info,
  X,
  FileText,
  Hash,
  Globe,
  KeyRound,
  List
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useGetVotingHistoryQuery } from '../../../redux/api/voting/votingApi';
import { 
  useVerifyByReceiptQuery,
  useVerifyByHashQuery,
  useGetPublicBulletinBoardQuery,
  useVerifyAnonymousVoteMutation
} from '../../../redux/api/verification/verificationApi';

export default function VoteHistoryTab() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
  
  // Verification states
  const [verificationType, setVerificationType] = useState(null);
  const [activeReceiptId, setActiveReceiptId] = useState(null);
  const [activeVoteHash, setActiveVoteHash] = useState(null);
  const [activeBulletinBoard, setActiveBulletinBoard] = useState(null);
  const [verificationInput, setVerificationInput] = useState('');
  const [anonymousVerification, setAnonymousVerification] = useState({
    receiptId: '',
    voteToken: '',
    verificationCode: ''
  });
  const [showVerificationCenter, setShowVerificationCenter] = useState(false);
  // ✅ NEW: Track if we should show result
  const [showVerificationResult, setShowVerificationResult] = useState(false);

  // 🔥 Redux API Hooks
  const { data: historyData, isLoading, error } = useGetVotingHistoryQuery(filters);
  
  // Receipt verification (conditional query)
  const { data: receiptVerification, isLoading: isVerifyingReceipt, error: receiptError } = useVerifyByReceiptQuery(
    activeReceiptId,
    { skip: !activeReceiptId }
  );

  // Hash verification (conditional query)
  const { data: hashVerification, isLoading: isVerifyingHash, error: hashError } = useVerifyByHashQuery(
    activeVoteHash,
    { skip: !activeVoteHash }
  );

  // Bulletin board (conditional query)
  const { data: bulletinBoardData, isLoading: isLoadingBulletin, error: bulletinError } = useGetPublicBulletinBoardQuery(
    activeBulletinBoard,
    { skip: !activeBulletinBoard }
  );

  // Anonymous verification (mutation)
  const [verifyAnonymous, { data: anonymousVerificationData, isLoading: isVerifyingAnonymous, error: anonymousError }] = useVerifyAnonymousVoteMutation();

  const votes = historyData?.data?.votes || [];
  const pagination = historyData?.data?.pagination || {};

  const filteredVotes = votes.filter(vote => 
    vote.election_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Watch for verification results and show them
  useEffect(() => {
    if (receiptVerification || receiptError || hashVerification || hashError || bulletinBoardData || bulletinError || anonymousVerificationData || anonymousError) {
      setShowVerificationResult(true);
    }
  }, [receiptVerification, receiptError, hashVerification, hashError, bulletinBoardData, bulletinError, anonymousVerificationData, anonymousError]);

  // ========================================
  // VERIFICATION HANDLERS
  // ========================================
  
  const handleVerifyByReceipt = () => {
    if (!verificationInput.trim()) {
      alert('Please enter a Receipt ID');
      return;
    }
    setShowVerificationResult(false);
    setActiveReceiptId(verificationInput.trim());
  };

  const handleVerifyByHash = () => {
    if (!verificationInput.trim()) {
      alert('Please enter a Vote Hash');
      return;
    }
    setShowVerificationResult(false);
    setActiveVoteHash(verificationInput.trim());
  };

  const handleViewBulletinBoard = () => {
    if (!verificationInput.trim()) {
      alert('Please enter an Election ID');
      return;
    }
    setShowVerificationResult(false);
    setActiveBulletinBoard({ 
      electionId: verificationInput.trim(), 
      page: 1, 
      limit: 50 
    });
  };

const handleVerifyAnonymousVote = async () => {
  const { receiptId, voteToken, verificationCode } = anonymousVerification;
  
  if (!receiptId || !voteToken || !verificationCode) {
    alert('Please fill in all fields');
    return;
  }

  console.log('🔐 Starting anonymous verification...');
  console.log('📋 Receipt ID:', receiptId);
  console.log('🎫 Vote Token:', voteToken.substring(0, 10) + '...');
  console.log('🔢 Verification Code:', verificationCode);

  try {
    setShowVerificationResult(false);
    console.log('📡 Calling API...');
    
    const result = await verifyAnonymous({
      receiptId: receiptId.trim(),
      voteToken: voteToken.trim(),
      verificationCode: verificationCode.trim()
    }).unwrap();
    
    console.log('✅ API Response:', result);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('Error details:', error.data || error.message);
  }
};

  // const handleVerifyAnonymousVote = async () => {
  //   const { receiptId, voteToken, verificationCode } = anonymousVerification;
    
  //   if (!receiptId || !voteToken || !verificationCode) {
  //     alert('Please fill in all fields');
  //     return;
  //   }

  //   try {
  //     setShowVerificationResult(false);
  //     await verifyAnonymous({
  //       receiptId: receiptId.trim(),
  //       voteToken: voteToken.trim(),
  //       verificationCode: verificationCode.trim()
  //     }).unwrap();
  //   } catch (error) {
  //     console.error('Anonymous verification error:', error);
  //   }
  // };

  const resetVerification = () => {
    // ✅ Reset all states
    setVerificationType(null);
    setVerificationInput('');
    setActiveReceiptId(null);
    setActiveVoteHash(null);
    setActiveBulletinBoard(null);
    setAnonymousVerification({ receiptId: '', voteToken: '', verificationCode: '' });
    setShowVerificationResult(false); // ✅ CRITICAL: Hide result
  };

  const quickVerifyVote = (vote) => {
    resetVerification(); // Reset first
    setActiveReceiptId(vote.receipt_id);
    setShowVerificationCenter(true);
  };

  // Determine current verification result
  const getVerificationResult = () => {
    // ✅ Only return result if we should show it
    if (!showVerificationResult) return null;

    if (receiptVerification) {
      return {
        success: true,
        type: 'receipt',
        data: receiptVerification.receipt
      };
    }
    if (receiptError) {
      return {
        success: false,
        error: receiptError?.data?.message || 'Receipt verification failed'
      };
    }
    if (hashVerification) {
      return {
        success: true,
        type: 'hash',
        data: hashVerification.vote
      };
    }
    if (hashError) {
      return {
        success: false,
        error: hashError?.data?.message || 'Hash verification failed'
      };
    }
    if (bulletinBoardData) {
      return {
        success: true,
        type: 'bulletin',
        data: bulletinBoardData.bulletinBoard
      };
    }
    if (bulletinError) {
      return {
        success: false,
        error: bulletinError?.data?.message || 'Could not load bulletin board'
      };
    }
    if (anonymousVerificationData) {
      return {
        success: true,
        type: 'anonymous',
        data: anonymousVerificationData.verification
      };
    }
    if (anonymousError) {
      return {
        success: false,
        error: anonymousError?.data?.message || 'Anonymous verification failed'
      };
    }
    return null;
  };

  const verificationResult = getVerificationResult();
  const isVerifying = isVerifyingReceipt || isVerifyingHash || isLoadingBulletin || isVerifyingAnonymous;

  // Download receipt as PDF (keeping your existing function)
  const downloadReceiptPDF = (vote) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('VOTTERY - VOTE RECEIPT', 105, 20, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    let yPos = 40;
    const lineHeight = 8;
    
    doc.setFont(undefined, 'bold');
    doc.text('Election:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(vote.election_title, 60, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Vote Type:', 20, yPos);
    doc.setFont(undefined, 'normal');
    const voteType = vote.is_anonymous_vote 
      ? 'Anonymous (Identity Protected)' 
      : 'Standard (Verified Identity)';
    doc.text(voteType, 60, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Vote ID:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(vote.voting_id, 60, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Receipt ID:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(vote.receipt_id, 60, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text('Timestamp:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(vote.created_at).toLocaleString(), 60, yPos);
    yPos += lineHeight + 5;
    
    if (vote.lottery_ticket_number) {
      doc.setFont(undefined, 'bold');
      doc.text('Lottery Ticket:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`#${vote.lottery_ticket_number}`, 60, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('Vote Hash (Cryptographic Proof):', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const hash = vote.vote_hash;
    const hashLines = doc.splitTextToSize(hash, 170);
    hashLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
    
    yPos += 10;
    doc.setFontSize(12);
    
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    if (vote.is_anonymous_vote) {
      doc.setFont(undefined, 'bold');
      doc.text('🔒 ANONYMOUS VOTING', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const anonymousText = [
        'Your identity is completely protected and not linked to your vote.',
        'Only you can verify this vote using your receipt ID.',
        'No one can link this vote back to you.'
      ];
      anonymousText.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
    } else {
      doc.setFont(undefined, 'bold');
      doc.text('✓ VERIFIED VOTING', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const verifiedText = [
        'Your identity was verified during voting.',
        'You can verify this vote anytime using your receipt ID.',
        'This vote is linked to your verified account.'
      ];
      verifiedText.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
    }
    
    yPos = 270;
    doc.line(20, yPos, 190, yPos);
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.text('This is your official vote receipt. Keep it safe for verification.', 105, yPos, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, yPos + 5, { align: 'center' });
    
    doc.save(`Vottery-Receipt-${vote.receipt_id}.pdf`);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Vote History</h1>
          <p className="text-gray-600">Track all your voting activity - secured in database</p>
        </div>
        
        <button
          onClick={() => {
            setShowVerificationCenter(true);
            resetVerification();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
        >
          <Shield size={20} />
          Verification Center
        </button>
      </div>

      {/* Stats - keeping your existing code */}
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

      {/* Search - keeping your existing code */}
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

      {/* Votes List - keeping all your existing vote cards */}
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {vote.election_title}
                      </h3>
                      
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

                {vote.is_anonymous_vote ? (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Lock className="text-purple-600 mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="font-semibold text-purple-900 mb-1">
                          🔒 Anonymous Vote - Identity Protected
                        </p>
                        <p className="text-sm text-purple-700">
                          Your identity is completely separated from your vote. Only you can verify this vote using your receipt ID.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <UserCheck className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-1">
                          ✓ Verified Vote - Identity Confirmed
                        </p>
                        <p className="text-sm text-blue-700">
                          Your identity was verified during voting. This vote is linked to your verified account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                      <p className="text-gray-600 font-semibold mb-1">Vote Hash</p>
                      <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200">
                        {vote.vote_hash?.slice(0, 32)}...
                      </p>
                    </div>
                  </div>
                </div>

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
                          Status: {vote.lottery_status || 'Pending Draw'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {vote.payment_amount && vote.payment_amount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-sm text-green-800">
                      Payment: {vote.payment_currency || 'USD'} {parseFloat(vote.payment_amount).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => downloadReceiptPDF(vote)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FileText size={20} />
                    Download PDF
                  </button>
                  
                  <button
                    onClick={() => quickVerifyVote(vote)}
                    disabled={isVerifying}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                  >
                    {isVerifying ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                    {isVerifying ? 'Verifying...' : 'Verify Vote'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination - keeping your existing code */}
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
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* VERIFICATION CENTER MODAL */}
      {showVerificationCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={32} />
                  <div>
                    <h2 className="text-2xl font-bold">Verification Center</h2>
                    <p className="text-purple-100 text-sm">Verify votes using multiple methods</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowVerificationCenter(false);
                    resetVerification();
                  }}
                  className="text-white hover:text-purple-200"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!verificationType && !verificationResult && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Choose Verification Method</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setVerificationType('receipt')}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                          <FileText className="text-purple-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Verify by Receipt ID</h4>
                          <p className="text-sm text-gray-600">Use your receipt ID to verify instantly</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setVerificationType('hash')}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                          <Hash className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Verify by Vote Hash</h4>
                          <p className="text-sm text-gray-600">Check vote integrity using hash</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setVerificationType('bulletin')}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                          <Globe className="text-green-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Public Bulletin Board</h4>
                          <p className="text-sm text-gray-600">View all votes transparently</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setVerificationType('anonymous')}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                          <KeyRound className="text-indigo-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Anonymous Verification</h4>
                          <p className="text-sm text-gray-600">Zero-knowledge proof</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {verificationType === 'receipt' && !verificationResult && (
                <div className="space-y-4">
                  <button onClick={resetVerification} className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1">
                    ← Back to methods
                  </button>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <FileText className="text-purple-600" size={24} />
                      Verify by Receipt ID
                    </h3>
                    <input
                      type="text"
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder="RCP-XXXXXXXXXX"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleVerifyByReceipt}
                      disabled={!verificationInput.trim() || isVerifying}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                      {isVerifying ? 'Verifying...' : 'Verify Now'}
                    </button>
                  </div>
                </div>
              )}

              {verificationType === 'hash' && !verificationResult && (
                <div className="space-y-4">
                  <button onClick={resetVerification} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                    ← Back to methods
                  </button>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Hash className="text-blue-600" size={24} />
                      Verify by Vote Hash
                    </h3>
                    <textarea
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder="Enter full vote hash..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <button
                      onClick={handleVerifyByHash}
                      disabled={!verificationInput.trim() || isVerifying}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                      {isVerifying ? 'Verifying...' : 'Verify Now'}
                    </button>
                  </div>
                </div>
              )}

              {verificationType === 'bulletin' && !verificationResult && (
                <div className="space-y-4">
                  <button onClick={resetVerification} className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1">
                    ← Back to methods
                  </button>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Globe className="text-green-600" size={24} />
                      Public Bulletin Board
                    </h3>
                    <input
                      type="text"
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder="Enter Election ID"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handleViewBulletinBoard}
                      disabled={!verificationInput.trim() || isVerifying}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader className="animate-spin" size={20} /> : <List size={20} />}
                      {isVerifying ? 'Loading...' : 'View Board'}
                    </button>
                  </div>
                </div>
              )}

              {verificationType === 'anonymous' && !verificationResult && (
                <div className="space-y-4">
                  <button onClick={resetVerification} className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                    ← Back to methods
                  </button>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <KeyRound className="text-indigo-600" size={24} />
                      Anonymous Verification
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={anonymousVerification.receiptId}
                        onChange={(e) => setAnonymousVerification({...anonymousVerification, receiptId: e.target.value})}
                        placeholder="Receipt ID"
                        className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={anonymousVerification.voteToken}
                        onChange={(e) => setAnonymousVerification({...anonymousVerification, voteToken: e.target.value})}
                        placeholder="Vote Token"
                        className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={anonymousVerification.verificationCode}
                        onChange={(e) => setAnonymousVerification({...anonymousVerification, verificationCode: e.target.value})}
                        placeholder="Verification Code"
                        className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleVerifyAnonymousVote}
                      disabled={!anonymousVerification.receiptId || !anonymousVerification.voteToken || !anonymousVerification.verificationCode || isVerifying}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader className="animate-spin" size={20} /> : <KeyRound size={20} />}
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}

              {verificationResult && (
                <div className="space-y-4">
                  <button 
                    onClick={resetVerification} 
                    className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1"
                  >
                    ← New Verification
                  </button>

                  {verificationResult.success ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                        <div>
                          <h3 className="text-xl font-bold text-green-800">Verified!</h3>
                          <p className="text-sm text-green-600">Cryptographically secure</p>
                        </div>
                      </div>

                      {(verificationResult.type === 'receipt' || verificationResult.type === 'hash') && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Election</p>
                              <p className="text-gray-800">{verificationResult.data.electionTitle || verificationResult.data.election_title}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Vote ID</p>
                              <p className="text-gray-800 font-mono text-sm">{(verificationResult.data.votingId || verificationResult.data.voting_id)?.slice(0, 16)}...</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Vote Hash</p>
                            <p className="text-gray-800 font-mono text-xs break-all bg-white p-2 rounded border border-gray-200">
                              {verificationResult.data.voteHash || verificationResult.data.vote_hash}
                            </p>
                          </div>
                        </div>
                      )}

                      {verificationResult.type === 'bulletin' && (
                        <div className="max-h-96 overflow-y-auto">
                          <p className="font-bold mb-2">{verificationResult.data.electionTitle}</p>
                          <p className="text-sm mb-3">Total: {verificationResult.data.totalVotes}</p>
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left">Vote ID</th>
                                <th className="px-3 py-2 text-left">Receipt</th>
                                <th className="px-3 py-2 text-left">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {verificationResult.data.votes?.map((vote, i) => (
                                <tr key={i} className="border-b">
                                  <td className="px-3 py-2 font-mono text-xs">{vote.voting_id?.slice(0, 12)}...</td>
                                  <td className="px-3 py-2 font-mono text-xs">{vote.receipt_id}</td>
                                  <td className="px-3 py-2">
                                    {vote.is_anonymous ? (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Anonymous</span>
                                    ) : (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Verified</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {verificationResult.type === 'anonymous' && (
                        <div className="space-y-3">
                          <div className="bg-indigo-50 border border-indigo-200 rounded p-4 flex items-start gap-3">
                            <KeyRound className="text-indigo-600 mt-0.5" size={24} />
                            <div>
                              <p className="font-semibold text-indigo-900 mb-1">Zero-Knowledge Proof Verified</p>
                              <p className="text-sm text-indigo-700">Vote verified without revealing identity</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                      <div className="flex items-center gap-3">
                        <X className="text-red-600" size={32} />
                        <div>
                          <h3 className="text-xl font-bold text-red-800">Failed</h3>
                          <p className="text-sm text-red-600">{verificationResult.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//this code is good but to verify by has and receipt above code
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
//   DollarSign,
//   Shield,
//   UserCheck,
//   Lock,
//   Info
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
// Vote Type: ${vote.is_anonymous_vote ? 'Anonymous (Identity Protected)' : 'Standard (Verified Identity)'}
// Vote ID: ${vote.voting_id}
// Receipt ID: ${vote.receipt_id}
// Timestamp: ${new Date(vote.created_at).toLocaleString()}
// ${vote.lottery_ticket_number ? `Gamified Election Ticket Number: #${vote.lottery_ticket_number}` : ''}

// Vote Hash: ${vote.vote_hash}

// ${vote.is_anonymous_vote ? `
// 🔒 ANONYMOUS VOTING
// Your identity is completely protected and not linked to your vote.
// Only you can verify this vote using your receipt ID.
// ` : `
// ✓ VERIFIED VOTING
// Your identity was verified during voting.
// You can verify this vote anytime using your receipt ID.
// `}

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
//             <div 
//               key={vote.id} 
//               className={`bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 ${
//                 vote.is_anonymous_vote 
//                   ? 'border-l-purple-500' 
//                   : 'border-l-blue-500'
//               }`}
//             >
//               <div className="p-6">
//                 {/* Header with Vote Type Badge */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-2">
//                       <h3 className="text-xl font-bold text-gray-800">
//                         {vote.election_title}
//                       </h3>
                      
//                       {/* Vote Type Badge */}
//                       {vote.is_anonymous_vote ? (
//                         <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 rounded-full">
//                           <Shield size={14} className="text-purple-700" />
//                           <span className="text-xs font-bold text-purple-700">
//                             ANONYMOUS
//                           </span>
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 rounded-full">
//                           <UserCheck size={14} className="text-blue-700" />
//                           <span className="text-xs font-bold text-blue-700">
//                             VERIFIED
//                           </span>
//                         </div>
//                       )}
//                     </div>
                    
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

//                 {/* Privacy Info Banner */}
//                 {vote.is_anonymous_vote ? (
//                   <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 rounded-lg p-4 mb-4">
//                     <div className="flex items-start gap-3">
//                       <Lock className="text-purple-600 mt-0.5 flex-shrink-0" size={20} />
//                       <div className="flex-1">
//                         <p className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
//                           🔒 Anonymous Vote - Identity Protected
//                         </p>
//                         <p className="text-sm text-purple-700">
//                           Your identity is completely separated from your vote. Only you can verify this vote using your receipt ID. 
//                           No one can link this vote back to you.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
//                     <div className="flex items-start gap-3">
//                       <UserCheck className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
//                       <div className="flex-1">
//                         <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
//                           ✓ Verified Vote - Identity Confirmed
//                         </p>
//                         <p className="text-sm text-blue-700">
//                           Your identity was verified during voting. This vote is linked to your verified account and can be audited if needed.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Receipt Info */}
//                 <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
//                   <div className="flex items-center gap-2 mb-3">
//                     <Info size={16} className="text-blue-600" />
//                     <p className="text-sm font-semibold text-gray-700">Vote Receipt Information</p>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-600 font-semibold mb-1">Receipt ID</p>
//                       <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200">
//                         {vote.receipt_id}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 font-semibold mb-1">Vote Hash (Cryptographic Proof)</p>
//                       <p className="font-mono text-xs text-gray-800 break-all bg-white px-2 py-1 rounded border border-gray-200">
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
//                           Gamified Election Ticket #{vote.lottery_ticket_number}
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