import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function VoteForm({ election, onSubmit, isSubmitting, existingVote }) {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (existingVote?.answers) {
      setAnswers(existingVote.answers);
      setIsEditing(true);
    }
  }, [existingVote]);

  const handleAnswerChange = (questionId, optionId, isMultiple = false) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      
      if (isMultiple) {
        // Multiple selection (approval voting)
        const current = newAnswers[questionId] || [];
        if (current.includes(optionId)) {
          newAnswers[questionId] = current.filter((id) => id !== optionId);
        } else {
          newAnswers[questionId] = [...current, optionId];
        }
      } else {
        // Single selection (plurality voting)
        newAnswers[questionId] = [optionId];
      }

      // Clear error for this question
      if (errors[questionId]) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[questionId];
          return newErrors;
        });
      }

      return newAnswers;
    });
  };

  const handleRankedChange = (questionId, optionId, rank) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      const current = newAnswers[questionId] || [];
      
      // Remove this option from any existing rank
      const filtered = current.filter((id) => id !== optionId);
      
      // Insert at the specified rank position
      filtered.splice(rank - 1, 0, optionId);
      
      newAnswers[questionId] = filtered;
      return newAnswers;
    });
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const validateAnswers = () => {
    const newErrors = {};
    
    election.questions.forEach((question) => {
      const answer = answers[question.id];
      
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        newErrors[question.id] = 'This question is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateAnswers()) {
      return;
    }

    onSubmit(answers);
  };

  const renderQuestion = (question, index) => {
    const isPlurality = election.voting_type === 'plurality';
    const isRanked = election.voting_type === 'ranked_choice';
    const isApproval = election.voting_type === 'approval';
    const isTextAnswer = question.question_type === 'text_answer';

    return (
      <div key={question.id} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Question {index + 1}
          </h3>
          <p className="text-gray-700">{question.question_text}</p>
          {question.question_image_url && (
            <img
              src={question.question_image_url}
              alt="Question"
              className="mt-3 rounded-lg max-h-64 object-cover"
            />
          )}
        </div>

        {errors[question.id] && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">{errors[question.id]}</span>
          </div>
        )}

        {isTextAnswer ? (
          // Text Answer
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          // Options
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isSelected = Array.isArray(answers[question.id])
                ? answers[question.id].includes(option.id)
                : false;
              const rank = isRanked && isSelected 
                ? answers[question.id].indexOf(option.id) + 1 
                : null;

              return (
                <div
                  key={option.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    if (isRanked) {
                      // For ranked choice, show rank selector
                      return;
                    }
                    handleAnswerChange(question.id, option.id, isApproval);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox/Radio */}
                    <div className="flex-shrink-0 mt-1">
                      {isApproval ? (
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <CheckCircle size={16} className="text-white" />}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Option Content */}
                    <div className="flex-1">
                      {option.option_image_url && (
                        <img
                          src={option.option_image_url}
                          alt={option.option_text}
                          className="mb-2 rounded max-h-32 object-cover"
                        />
                      )}
                      <p className="text-gray-800 font-medium">{option.option_text}</p>
                    </div>

                    {/* Rank Badge (for ranked choice) */}
                    {isRanked && isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {rank}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ranked Choice Selector */}
                  {isRanked && (
                    <div className="mt-3 flex gap-2">
                      <span className="text-sm text-gray-600">Rank:</span>
                      {[1, 2, 3, 4, 5].slice(0, question.options.length).map((rankNum) => (
                        <button
                          key={rankNum}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRankedChange(question.id, option.id, rankNum);
                          }}
                          className={`w-8 h-8 rounded-full border-2 text-sm font-semibold transition ${
                            rank === rankNum
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-blue-400'
                          }`}
                        >
                          {rankNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Voting Type Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          {isPlurality && '📌 Select one option'}
          {isApproval && '📌 Select all options you approve'}
          {isRanked && '📌 Rank options in order of preference (1 = most preferred)'}
          {isTextAnswer && '📌 Provide your answer in text'}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-900 mb-2">
          {isEditing ? '✏️ Edit Your Vote' : '🗳️ Cast Your Vote'}
        </h2>
        <p className="text-blue-700 text-sm">
          {isEditing
            ? 'You can update your vote below. Your previous vote will be replaced.'
            : 'Please answer all questions below to submit your vote.'}
        </p>
      </div>

      {election.questions?.map((question, index) => renderQuestion(question, index))}

      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6">
        <div>
          <p className="text-sm text-gray-600">
            {Object.keys(answers).length} of {election.questions?.length} questions answered
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Submitting...' : isEditing ? 'Update Vote' : 'Submit Vote'}
        </button>
      </div>
    </form>
  );
}