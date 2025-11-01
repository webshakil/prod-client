import React from 'react';
import { CheckCircle, AlertCircle, Vote, Wallet, Loader, ArrowRight, Lock, Info, Play } from 'lucide-react';

export default function VoteTab({
  election,
  selectedAnswers,
  onAnswerSelect,
  applicableFee,
  agreeToTerms,
  setAgreeToTerms,
  onSubmit,
  votingInProgress,
  videoUrl,
  videoWatched,
  onWatchVideo
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>
      
      {/* Video requirement check */}
      {videoUrl && !videoWatched && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Video Required</h3>
              <p className="text-yellow-800 mb-4">
                You must watch the election video before you can submit your vote.
              </p>
              <button
                onClick={onWatchVideo}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <Play size={16} />
                Watch Video Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Questions */}
      {election.questions?.map((question, index) => (
        <div key={question.id} className="mb-8 last:mb-0 border-b pb-6 last:border-0">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {question.question_text}
                {question.is_required && (
                  <span className="text-red-600 ml-1">*</span>
                )}
              </h3>
            </div>
          </div>

          <div className="ml-13 space-y-3">
            {question.options?.map((option) => {
              const isSelected = selectedAnswers[question.id]?.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => onAnswerSelect(
                    question.id, 
                    option.id, 
                    question.question_type,
                    question.max_selections
                  )}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="text-white" size={16} />
                      )}
                    </div>
                    <span className={`flex-1 font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option.option_text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Payment Summary (if paid) */}
      {!election.is_free && applicableFee && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            <Wallet className="inline mr-2" size={24} />
            Payment Summary
          </h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Payment:</span>
              <span className="text-2xl font-bold text-orange-600">
                {applicableFee.currency} {applicableFee.total.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600 bg-white p-3 rounded">
              <p className="mb-1">• Processing Fee: {applicableFee.currency} {applicableFee.processingFee.toFixed(2)} (deducted immediately)</p>
              <p>• Frozen Amount: {applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)} (held until election ends)</p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer border-2 border-gray-200 hover:border-orange-400">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              I agree that {applicableFee.currency} {applicableFee.processingFee.toFixed(2)} will be deducted as processing fee and {applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)} will be frozen in my wallet until the election ends and is used for prize distribution.
            </span>
          </label>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={votingInProgress || (videoUrl && !videoWatched)}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 ${
          votingInProgress || (videoUrl && !videoWatched)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {votingInProgress ? (
          <>
            <Loader className="animate-spin" size={24} />
            Processing...
          </>
        ) : videoUrl && !videoWatched ? (
          <>
            <Lock size={24} />
            Watch Video to Continue
          </>
        ) : (
          <>
            <Vote size={24} />
            {election.is_free ? 'Submit Vote' : 'Pay & Vote Now'}
            <ArrowRight size={24} />
          </>
        )}
      </button>
    </div>
  );
}