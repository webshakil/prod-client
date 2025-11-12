// src/components/Dashboard/Tabs/voting/ApprovalBallot.jsx
// ✨ Approval Voting - Multiple Selection
import React from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

export default function ApprovalBallot({ 
  ballot,
  answers,
  onAnswersChange,
  disabled = false,
  validationErrors = [],
}) {
  const handleOptionToggle = (questionId, optionId) => {
    if (disabled) return;

    const currentSelections = answers[questionId] || [];
    
    let newSelections;
    if (currentSelections.includes(optionId)) {
      // Remove selection
      newSelections = currentSelections.filter(id => id !== optionId);
    } else {
      // Add selection
      newSelections = [...currentSelections, optionId];
    }

    onAnswersChange({
      ...answers,
      [questionId]: newSelections,
    });
  };

  return (
    <div className="space-y-8">
      {ballot?.questions?.map((question, qIndex) => {
        const selectedOptions = answers[question.id] || [];
        const hasError = validationErrors.some(err => err.questionId === question.id);

        return (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.1 }}
            className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
              hasError ? 'border-red-300' : 'border-gray-200'
            }`}
          >
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {question.question_text}
                  </h3>
                  {question.description && (
                    <p className="text-gray-600 text-sm">{question.description}</p>
                  )}
                  <p className="text-green-600 text-sm font-semibold mt-2">
                    ✅ Select ALL options you approve of
                  </p>
                  {question.is_required && (
                    <span className="inline-block mt-2 text-xs font-semibold text-red-600">
                      * Required (at least one)
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {hasError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mt-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">
                    {validationErrors.find(err => err.questionId === question.id)?.message}
                  </p>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options?.map((option, oIndex) => {
                const isSelected = selectedOptions.includes(option.id);

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    onClick={() => handleOptionToggle(question.id, option.id)}
                    disabled={disabled}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-green-50 border-green-600 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-green-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-green-600 bg-green-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>

                      {/* Option Content */}
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          isSelected ? 'text-green-900' : 'text-gray-800'
                        }`}>
                          {option.option_text}
                        </p>
                        {option.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>

                      {/* Option Letter */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + oIndex)}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedOptions.length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2 text-sm">
                  ✓ Approved Options ({selectedOptions.length}/{question.options?.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map(optionId => {
                    const option = question.options.find(o => o.id === optionId);
                    return (
                      <span 
                        key={optionId}
                        className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {option?.option_text}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Selection Warning */}
            {selectedOptions.length === 0 && question.is_required && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Please select at least one option to proceed
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}