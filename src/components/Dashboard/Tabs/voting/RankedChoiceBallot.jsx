// src/components/Dashboard/Tabs/voting/RankedChoiceBallot.jsx
// ✨ Ranked Choice Voting - Drag & Drop Ranking
import React, { useState, useEffect } from 'react';
/*eslint-disable*/
import { motion, Reorder } from 'framer-motion';
import { GripVertical, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

export default function RankedChoiceBallot({ 
  ballot,
  answers,
  onAnswersChange,
  disabled = false,
  validationErrors = [],
}) {
  // Local state for each question's ranking
  const [rankings, setRankings] = useState({});

  // Initialize rankings from answers
  useEffect(() => {
    if (!ballot?.questions) return;

    const initialRankings = {};
    ballot.questions.forEach(question => {
      if (answers[question.id] && Array.isArray(answers[question.id])) {
        // Answers already in ranked order
        initialRankings[question.id] = answers[question.id];
      } else {
        // Initialize with unranked options
        initialRankings[question.id] = question.options?.map(o => o.id) || [];
      }
    });
    setRankings(initialRankings);
  }, [ballot, answers]);

  const handleReorder = (questionId, newOrder) => {
    setRankings(prev => ({
      ...prev,
      [questionId]: newOrder,
    }));

    // Update parent answers
    onAnswersChange({
      ...answers,
      [questionId]: newOrder,
    });
  };

  const moveOption = (questionId, optionId, direction) => {
    const currentRanking = rankings[questionId] || [];
    const currentIndex = currentRanking.indexOf(optionId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === currentRanking.length - 1)
    ) {
      return; // Can't move
    }

    const newRanking = [...currentRanking];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap
    [newRanking[currentIndex], newRanking[newIndex]] = 
    [newRanking[newIndex], newRanking[currentIndex]];

    handleReorder(questionId, newRanking);
  };

  const getOptionById = (options, optionId) => {
    return options.find(o => o.id === optionId);
  };

  return (
    <div className="space-y-8">
      {ballot?.questions?.map((question, qIndex) => {
        const ranking = rankings[question.id] || [];
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
                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {question.question_text}
                  </h3>
                  {question.description && (
                    <p className="text-gray-600 text-sm">{question.description}</p>
                  )}
                  <p className="text-purple-600 text-sm font-semibold mt-2">
                    📊 Drag to rank options in order of preference (1st = most preferred)
                  </p>
                  {question.is_required && (
                    <span className="inline-block mt-2 text-xs font-semibold text-red-600">
                      * Required
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

            {/* Ranked Options */}
            <Reorder.Group
              axis="y"
              values={ranking}
              onReorder={(newOrder) => handleReorder(question.id, newOrder)}
              className="space-y-3"
            >
              {ranking.map((optionId, index) => {
                const option = getOptionById(question.options, optionId);
                if (!option) return null;

                return (
                  <Reorder.Item
                    key={optionId}
                    value={optionId}
                    className={`bg-gradient-to-r ${
                      index === 0 ? 'from-yellow-50 to-orange-50 border-yellow-400' :
                      index === 1 ? 'from-gray-50 to-gray-100 border-gray-400' :
                      index === 2 ? 'from-orange-50 to-red-50 border-orange-400' :
                      'from-gray-50 to-white border-gray-200'
                    } border-2 rounded-xl p-4 cursor-grab active:cursor-grabbing ${
                      disabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <GripVertical className="w-6 h-6 text-gray-400 flex-shrink-0" />

                      {/* Rank Number */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Option Content */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {option.option_text}
                        </p>
                        {option.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>

                      {/* Move Buttons */}
                      {!disabled && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveOption(question.id, optionId, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <ArrowUp className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => moveOption(question.id, optionId, 'down')}
                            disabled={index === ranking.length - 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <ArrowDown className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      )}

                      {/* Rank Badge */}
                      {index < 3 && (
                        <div className="text-2xl">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Ranking Summary */}
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800 font-semibold mb-2 text-sm">Your Ranking:</p>
              <ol className="space-y-1">
                {ranking.slice(0, 3).map((optionId, index) => {
                  const option = getOptionById(question.options, optionId);
                  return (
                    <li key={optionId} className="text-purple-700 text-sm">
                      {index + 1}. {option?.option_text}
                    </li>
                  );
                })}
                {ranking.length > 3 && (
                  <li className="text-purple-600 text-xs italic">
                    ... and {ranking.length - 3} more
                  </li>
                )}
              </ol>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}