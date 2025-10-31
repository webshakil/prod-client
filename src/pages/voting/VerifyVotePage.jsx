import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Shield, Loader, ArrowLeft } from 'lucide-react';
import { useVerifyReceiptQuery } from '../../redux/api/voting/votingApi';

export default function VerifyVotePage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();

  const { data: verifyData, isLoading, error } = useVerifyReceiptQuery(receiptId);
  const verification = verifyData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Verifying vote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {error || !verification ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-500 p-8 text-center">
              <XCircle className="mx-auto mb-4 text-white" size={64} />
              <h2 className="text-3xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-red-100">
                This receipt could not be verified. It may be invalid or expired.
              </p>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Receipt ID: <span className="font-mono">{receiptId}</span>
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-white" size={64} />
              <h2 className="text-3xl font-bold text-white mb-2">Vote Verified!</h2>
              <p className="text-green-100">
                This vote has been successfully verified and recorded in the blockchain.
              </p>
            </div>

            {/* Verification Details */}
            <div className="p-8 space-y-6">
              {/* Receipt ID */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  Receipt ID
                </h3>
                <div className="bg-gray-50 p-4 rounded font-mono text-sm break-all">
                  {verification.receipt_id}
                </div>
              </div>

              {/* Election Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Election</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-800 mb-1">
                    {verification.election_title}
                  </p>
                  <p className="text-sm text-gray-600">
                    Election ID: {verification.election_id}
                  </p>
                </div>
              </div>

              {/* Vote Hash */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vote Hash (Cryptographic Proof)</h3>
                <div className="bg-gray-50 p-4 rounded font-mono text-xs break-all">
                  {verification.vote_hash}
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Timestamp</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {new Date(verification.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="text-green-600" size={32} />
                  <div>
                    <h4 className="font-bold text-green-900 text-lg">Verified Authentic</h4>
                    <p className="text-green-700 text-sm">This vote is cryptographically verified</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Vote hash matches blockchain record
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Receipt ID is valid and unique
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Timestamp verified and immutable
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Vote counted in election results
                  </li>
                </ul>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🔐 What does this mean?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your vote was successfully cast and encrypted</li>
                  <li>• The vote is stored on an immutable blockchain</li>
                  <li>• Your vote cannot be altered or deleted</li>
                  <li>• Your vote is counted in the final results</li>
                  <li>• Your identity remains anonymous</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => navigate(`/vote/${verification.election_slug}`)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  View Election
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}