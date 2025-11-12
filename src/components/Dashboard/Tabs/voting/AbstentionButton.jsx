// src/components/Dashboard/Tabs/voting/AbstentionButton.jsx
// ✨ Abstention Button for Questions
import React, { useState } from 'react';
/*eslint-disable*/
import { motion, AnimatePresence } from 'framer-motion';
import { MinusCircle, X, MessageSquare } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { recordAbstention } from '../../../../../redux/slices/votingNewSlice';
import { useRecordAbstentionMutation } from '../../../../../redux/api/voting/votingApi';
import { toast } from 'react-toastify';

export default function AbstentionButton({ 
  questionId,
  questionText,
  electionId,
  disabled = false,
  onAbstain = null,
}) {
  const dispatch = useDispatch();
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [recordAbstentionMutation, { isLoading }] = useRecordAbstentionMutation();

  const handleAbstainClick = () => {
    setShowReasonModal(true);
  };

  const handleConfirmAbstention = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for abstaining');
      return;
    }

    try {
      // Record abstention via API
      await recordAbstentionMutation({
        electionId,
        questionId,
        reason: reason.trim(),
      }).unwrap();

      // Update local state
      dispatch(recordAbstention({
        questionId,
        reason: reason.trim(),
      }));

      toast.success('Abstention recorded');
      setShowReasonModal(false);
      setReason('');

      if (onAbstain) {
        onAbstain(questionId, reason.trim());
      }
    } catch (error) {
      console.error('Abstention error:', error);
      toast.error(error.data?.error || 'Failed to record abstention');
    }
  };

  const predefinedReasons = [
    'Insufficient information',
    'Conflict of interest',
    'No strong preference',
    'Need more time to decide',
    'Question unclear',
    'Other',
  ];

  return (
    <>
      {/* Abstain Button */}
      <button
        onClick={handleAbstainClick}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MinusCircle className="w-5 h-5" />
        <span className="font-semibold">Abstain</span>
      </button>

      {/* Reason Modal */}
      <AnimatePresence>
        {showReasonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReasonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <MinusCircle className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Abstain from Question</h2>
                  </div>
                  <button
                    onClick={() => setShowReasonModal(false)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-orange-100 text-sm">
                  {questionText}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-700 text-sm">
                  Please select or provide a reason for abstaining from this question:
                </p>

                {/* Predefined Reasons */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quick Reasons:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedReasons.map((predefinedReason) => (
                      <button
                        key={predefinedReason}
                        onClick={() => setReason(predefinedReason)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          reason === predefinedReason
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {predefinedReason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or write your own reason:
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter your reason for abstaining..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-900 font-semibold text-sm mb-1">
                        What happens when you abstain?
                      </p>
                      <ul className="text-blue-800 text-xs space-y-1">
                        <li>✓ Your abstention is recorded for this question</li>
                        <li>✓ You won't need to answer this question to submit your vote</li>
                        <li>✓ Your reason will be logged (visible to administrators)</li>
                        <li>✓ You can still answer other questions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => setShowReasonModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAbstention}
                    disabled={!reason.trim() || isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Recording...' : 'Confirm Abstention'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}