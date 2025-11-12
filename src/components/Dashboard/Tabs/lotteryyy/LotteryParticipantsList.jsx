// src/components/Dashboard/Tabs/lotteryyy/LotteryParticipantsList.jsx
// ✨ Admin view of all lottery participants
import React, { useState } from 'react';
/*eslint-disable*/
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Download, Filter } from 'lucide-react';

export default function LotteryParticipantsList({ 
  participants = [],
  loading = false,
  onClose = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnonymous, setFilterAnonymous] = useState('all'); // all, anonymous, identified

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = 
      p.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ball_number?.toString().includes(searchTerm) ||
      p.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterAnonymous === 'all' ||
      (filterAnonymous === 'anonymous' && p.anonymous) ||
      (filterAnonymous === 'identified' && !p.anonymous);

    return matchesSearch && matchesFilter;
  });

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['Ticket Number', 'Ball Number', 'User Name', 'Anonymous', 'Created At'],
      ...filteredParticipants.map(p => [
        p.ticket_number,
        p.ball_number,
        p.anonymous ? 'Anonymous' : p.user_name,
        p.anonymous ? 'Yes' : 'No',
        new Date(p.created_at).toLocaleString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lottery-participants-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Lottery Participants</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ball number, or ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <select
                  value={filterAnonymous}
                  onChange={(e) => setFilterAnonymous(e.target.value)}
                  className="px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="all">All Participants</option>
                  <option value="identified">Identified</option>
                  <option value="anonymous">Anonymous</option>
                </select>

                {/* Export */}
                <button
                  onClick={handleExport}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden md:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading participants...</p>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No participants found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredParticipants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {participant.anonymous ? '?' : (participant.user_name?.[0] || 'U')}
                          </div>

                          {/* Name */}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {participant.anonymous ? 'Anonymous Voter' : participant.user_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {participant.ticket_number}
                            </p>
                          </div>
                        </div>

                        {/* Ball Number */}
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Ball #{participant.ball_number?.toString().slice(-4)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(participant.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Full Ball Number */}
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Full Number</p>
                        <p className="text-sm font-mono font-semibold text-gray-800">
                          {participant.ball_number}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <strong>{filteredParticipants.length}</strong> of <strong>{participants.length}</strong> participants
              </p>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}