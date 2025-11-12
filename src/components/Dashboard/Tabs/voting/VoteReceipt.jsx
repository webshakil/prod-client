// src/components/Dashboard/Tabs/voting/VoteReceipt.jsx
// ✨ Digital Vote Receipt with QR Code
import React, { useRef } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Download, Share2, CheckCircle, Shield, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export default function VoteReceipt({ 
  receiptId,
  voteHash,
  verificationCode,
  electionId,
  electionName,
  votedAt,
  anonymous = false,
  encryptionVerified = false,
  onVerify = null,
}) {
  const receiptRef = useRef(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleCopyReceiptId = () => {
    navigator.clipboard.writeText(receiptId);
    toast.success('Receipt ID copied to clipboard!');
  };

  const handleCopyVoteHash = () => {
    navigator.clipboard.writeText(voteHash);
    toast.success('Vote hash copied to clipboard!');
  };

  const handleCopyVerificationCode = () => {
    navigator.clipboard.writeText(verificationCode);
    toast.success('Verification code copied to clipboard!');
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Receipt - ${receiptId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; }
            .value { font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 4px; word-break: break-all; }
            .qr-code { text-align: center; margin: 20px 0; }
            .footer { border-top: 2px solid #333; padding-top: 20px; margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🗳️ Vote Receipt</h1>
            <p>${electionName}</p>
          </div>
          
          <div class="section">
            <div class="label">Receipt ID</div>
            <div class="value">${receiptId}</div>
          </div>
          
          <div class="section">
            <div class="label">Vote Hash</div>
            <div class="value">${voteHash}</div>
          </div>
          
          <div class="section">
            <div class="label">Verification Code</div>
            <div class="value">${verificationCode}</div>
          </div>
          
          <div class="section">
            <div class="label">Voted At</div>
            <div class="value">${formatDate(votedAt)}</div>
          </div>
          
          <div class="qr-code">
            <div id="qr-container"></div>
          </div>
          
          <div class="footer">
            <p>✅ Your vote has been securely recorded</p>
            <p>🔒 This receipt can be used to verify your vote</p>
            <p>Keep this receipt for your records</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = () => {
    const shareText = `I voted in "${electionName}"!\n\nReceipt ID: ${receiptId}\n\nVerify my vote: ${window.location.origin}/verify/${receiptId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Vote Receipt',
        text: shareText,
      }).catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Receipt info copied to clipboard!');
    }
  };

  const verificationUrl = `${window.location.origin}/verify/${receiptId}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div ref={receiptRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-green-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-black mb-2">Vote Confirmed!</h1>
          <p className="text-green-100 text-lg">Your vote has been securely recorded</p>
        </div>

        {/* Receipt Content */}
        <div className="p-8 space-y-6">
          {/* Election Name */}
          <div className="text-center pb-6 border-b-2 border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Election</p>
            <p className="text-2xl font-bold text-gray-800">{electionName}</p>
          </div>

          {/* Receipt ID */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-800 font-semibold text-sm">Receipt ID</p>
              <button
                onClick={handleCopyReceiptId}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-sm text-blue-900 break-all bg-white p-3 rounded">
              {receiptId}
            </p>
          </div>

          {/* Vote Hash */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-800 font-semibold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Vote Hash (Encrypted)
              </p>
              <button
                onClick={handleCopyVoteHash}
                className="text-purple-600 hover:text-purple-800 transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-xs text-purple-900 break-all bg-white p-3 rounded">
              {voteHash}
            </p>
            {encryptionVerified && (
              <div className="mt-2 bg-green-100 border border-green-300 rounded-lg p-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-800 text-xs font-semibold">
                  ✓ Encryption verified
                </p>
              </div>
            )}
          </div>

          {/* Verification Code */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-yellow-800 font-semibold text-sm">Verification Code</p>
              <button
                onClick={handleCopyVerificationCode}
                className="text-yellow-600 hover:text-yellow-800 transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-2xl text-yellow-900 text-center font-bold tracking-wider bg-white p-3 rounded">
              {verificationCode}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-700 font-semibold mb-4 text-sm">
              Scan to verify your vote
            </p>
            <div className="bg-white p-4 inline-block rounded-lg">
              <QRCode
                value={verificationUrl}
                size={200}
                level="H"
              />
            </div>
            <p className="text-gray-500 text-xs mt-4 font-mono break-all">
              {verificationUrl}
            </p>
          </div>

          {/* Vote Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-xs mb-1">Voted At</p>
              <p className="text-gray-800 font-semibold text-sm">
                {formatDate(votedAt)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-xs mb-1">Anonymous</p>
              <p className="text-gray-800 font-semibold text-sm">
                {anonymous ? '✓ Yes' : '✗ No'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Verify Button */}
          {onVerify && (
            <button
              onClick={onVerify}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-6 h-6" />
              Verify My Vote Now
            </button>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h4 className="text-yellow-900 font-bold mb-2 text-sm">📋 Important Notes:</h4>
            <ul className="text-yellow-800 text-xs space-y-1">
              <li>✓ Keep this receipt for your records</li>
              <li>✓ You can verify your vote anytime using the Receipt ID</li>
              <li>✓ Your vote is encrypted and cannot be traced back to you</li>
              <li>✓ The verification code proves your vote was counted</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t-2 border-gray-200">
          <p className="text-gray-600 text-sm">
            🔒 Secured by end-to-end encryption
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by Vottery - Transparent & Verifiable Voting
          </p>
        </div>
      </div>
    </motion.div>
  );
}