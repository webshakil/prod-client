// src/components/Dashboard/Tabs/lotteryyy/MyLotteryTicket.jsx
// ✨ User's Lottery Ticket Card
import React from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { Ticket, Trophy, Eye, Share2, Download } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function MyLotteryTicket({ 
  ticket = null,
  ballNumber = null,
  hasTicket = false,
  amIWinner = false,
  myPrize = null,
  myRank = null,
  prizeClaimed = false,
  electionId = null,
  onViewInMachine = null,
  onShare = null,
  onClaimPrize = null,
}) {
  if (!hasTicket || !ticket) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center"
      >
        <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold mb-2">No Lottery Ticket Yet</p>
        <p className="text-gray-500 text-sm">
          Vote in this election to receive your lottery ticket automatically!
        </p>
      </motion.div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    // Create a simple ticket image/PDF download
    const ticketData = {
      ticketNumber: ticket.ticket_number,
      ballNumber: ballNumber,
      electionId: electionId,
      createdAt: ticket.created_at,
    };
    
    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lottery-ticket-${ticket.ticket_number}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-3xl shadow-2xl overflow-hidden ${
        amIWinner 
          ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500' 
          : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500'
      }`}
    >
      {/* Winner Badge */}
      {amIWinner && (
        <motion.div
          initial={{ rotate: -45, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          className="absolute top-4 right-4 bg-white text-yellow-600 px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10"
        >
          🏆 WINNER!
        </motion.div>
      )}

      {/* Ticket Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }}></div>
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold opacity-80">LOTTERY TICKET</p>
              <p className="text-white text-sm font-mono">{ticket.ticket_number}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-2 rounded-lg">
            <QRCode
              value={ticket.ticket_number}
              size={60}
              level="M"
            />
          </div>
        </div>

        {/* Ball Number */}
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 mb-6">
          <p className="text-white text-sm font-semibold opacity-80 mb-2">YOUR BALL NUMBER</p>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
              <span className="text-4xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {ballNumber?.toString().slice(-4)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-2xl font-bold">{ballNumber}</p>
              <p className="text-white text-xs opacity-75">Full ball number</p>
            </div>
          </div>
        </div>

        {/* Winner Info */}
        {amIWinner && myPrize && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-green-500 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <p className="text-white font-bold text-lg">
                {myRank === 1 && '🥇 1st Place'}
                {myRank === 2 && '🥈 2nd Place'}
                {myRank === 3 && '🥉 3rd Place'}
                {myRank > 3 && `🏅 Rank #${myRank}`}
              </p>
            </div>
            
            <p className="text-yellow-300 text-3xl font-black mb-4">
              ${myPrize?.toLocaleString() || '0'}
            </p>

            {!prizeClaimed && onClaimPrize && (
              <button
                onClick={onClaimPrize}
                className="w-full bg-white text-green-600 py-3 rounded-xl font-bold hover:bg-yellow-100 transition transform hover:scale-105 shadow-lg"
              >
                💰 CLAIM YOUR PRIZE
              </button>
            )}

            {prizeClaimed && (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white font-semibold">✅ Prize Claimed</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Ticket Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white text-xs opacity-75 mb-1">Created</p>
            <p className="text-white text-sm font-semibold">
              {formatDate(ticket.created_at)}
            </p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white text-xs opacity-75 mb-1">Election ID</p>
            <p className="text-white text-sm font-semibold font-mono">
              {electionId?.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          {onViewInMachine && (
            <button
              onClick={onViewInMachine}
              className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white py-3 rounded-xl font-semibold transition flex flex-col items-center gap-1"
            >
              <Eye className="w-5 h-5" />
              <span className="text-xs">View</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white py-3 rounded-xl font-semibold transition flex flex-col items-center gap-1"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </button>

          {onShare && (
            <button
              onClick={onShare}
              className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white py-3 rounded-xl font-semibold transition flex flex-col items-center gap-1"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute bottom-0 right-0">
        <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-20">
          <circle cx="100" cy="100" r="80" fill="white" />
        </svg>
      </div>
    </motion.div>
  );
}