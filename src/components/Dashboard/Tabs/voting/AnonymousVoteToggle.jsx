// src/components/Dashboard/Tabs/voting/AnonymousVoteToggle.jsx
// ✨ Anonymous Voting Toggle
import React from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAnonymousVoting } from '../../../../redux/slices/votingNewSlice';
//import { setAnonymousVoting } from '../../../../../redux/slices/votingNewSlice';

export default function AnonymousVoteToggle({ 
  enabled = true,
  disabled = false,
}) {
  const dispatch = useDispatch();
  const { votingAnonymously, anonymousVotingEnabled } = useSelector(state => state.votingNew);

  if (!anonymousVotingEnabled) {
    return null; // Don't show if anonymous voting not enabled for this election
  }

  const handleToggle = () => {
    if (disabled) return;
    dispatch(setAnonymousVoting(!votingAnonymously));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl shadow-lg overflow-hidden ${
        votingAnonymously 
          ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
          : 'bg-white border-2 border-gray-200'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${
            votingAnonymously 
              ? 'bg-white bg-opacity-20' 
              : 'bg-purple-100'
          }`}>
            <Shield className={`w-8 h-8 ${
              votingAnonymously ? 'text-white' : 'text-purple-600'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xl font-bold ${
                votingAnonymously ? 'text-white' : 'text-gray-800'
              }`}>
                Anonymous Voting
              </h3>

              {/* Toggle Switch */}
              <button
                onClick={handleToggle}
                disabled={disabled}
                className={`relative w-16 h-8 rounded-full transition ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  votingAnonymously 
                    ? 'bg-white bg-opacity-30' 
                    : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: votingAnonymously ? 32 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-6 h-6 rounded-full ${
                    votingAnonymously ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              </button>
            </div>

            <p className={`text-sm mb-4 ${
              votingAnonymously ? 'text-white text-opacity-90' : 'text-gray-600'
            }`}>
              {votingAnonymously 
                ? 'Your vote will be completely anonymous and cannot be traced back to you.'
                : 'Your vote will be recorded with your identity for transparency.'
              }
            </p>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              votingAnonymously 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {votingAnonymously ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Anonymous Mode Active
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Public Vote
                </>
              )}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className={`mt-4 p-4 rounded-xl ${
          votingAnonymously 
            ? 'bg-white bg-opacity-10' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            <Info className={`w-5 h-5 flex-shrink-0 ${
              votingAnonymously ? 'text-white' : 'text-blue-600'
            }`} />
            <div>
              <h4 className={`font-semibold text-sm mb-2 ${
                votingAnonymously ? 'text-white' : 'text-blue-900'
              }`}>
                {votingAnonymously ? 'What is Anonymous Voting?' : 'What is Public Voting?'}
              </h4>
              <ul className={`text-xs space-y-1 ${
                votingAnonymously ? 'text-white text-opacity-90' : 'text-blue-800'
              }`}>
                {votingAnonymously ? (
                  <>
                    <li>✓ Your name won't appear on the public bulletin board</li>
                    <li>✓ Your vote is still encrypted and verifiable</li>
                    <li>✓ You'll still receive a receipt to verify your vote was counted</li>
                    <li>✓ No one can see how you voted, including administrators</li>
                  </>
                ) : (
                  <>
                    <li>✓ Your name will appear on the public bulletin board</li>
                    <li>✓ Increases transparency and accountability</li>
                    <li>✓ Your vote choices remain private and encrypted</li>
                    <li>✓ Only shows that you voted, not how you voted</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}