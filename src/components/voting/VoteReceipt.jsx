import React from 'react';
import { CheckCircle, Download, Share2, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export default function VoteReceipt({ receipt, election }) {
  const handleDownload = () => {
    const receiptData = {
      electionTitle: election.title,
      receiptId: receipt.receipt_id,
      votingId: receipt.voting_id,
      timestamp: receipt.timestamp,
      voteHash: receipt.vote_hash,
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${receipt.receipt_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/${receipt.receipt_id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Verification link copied!');
  };

  const handleVerify = () => {
    window.open(`/verify/${receipt.receipt_id}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 text-white" size={64} />
        <h2 className="text-3xl font-bold text-white mb-2">Vote Submitted!</h2>
        <p className="text-green-100">
          Your vote has been recorded successfully and encrypted for security.
        </p>
      </div>

      {/* Receipt Details */}
      <div className="p-6 space-y-6">
        {/* Receipt ID */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Receipt ID</h3>
          <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
            {receipt.receipt_id}
          </div>
        </div>

        {/* Voting ID */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Voting ID</h3>
          <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
            {receipt.voting_id}
          </div>
        </div>

        {/* Timestamp */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Timestamp</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            {new Date(receipt.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Vote Hash */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Vote Hash (Verification)</h3>
          <div className="bg-gray-50 p-3 rounded font-mono text-xs break-all">
            {receipt.vote_hash}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📌 Important</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save your receipt ID for verification purposes</li>
            <li>• Your vote is encrypted and anonymous</li>
            <li>• You can verify your vote was counted using the receipt ID</li>
            {election.lottery_config?.is_lotterized && (
              <li>• Your lottery ticket has been automatically created</li>
            )}
          </ul>
        </div>

        {/* Lottery Info */}
        {election.lottery_config?.is_lotterized && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <h4 className="text-xl font-bold mb-2">🎰 Lottery Entry Created!</h4>
            <p className="text-purple-100 mb-3">
              You have been automatically entered into the lottery draw.
            </p>
            <div className="bg-white/20 rounded p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Prize Pool:</span>
                <span className="font-bold">
                  ${election.lottery_config.reward_amount || 'TBD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Winners:</span>
                <span className="font-bold">{election.lottery_config.winner_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Draw Time:</span>
                <span className="font-bold">At Election End</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={20} />
            Download
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Share2 size={20} />
            Share Link
          </button>
          <button
            onClick={handleVerify}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <ExternalLink size={20} />
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}