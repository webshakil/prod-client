// src/components/Dashboard/Tabs/voting/PluralityBallot.jsx
// ✨ EXACT CLIENT SPECIFICATION - Plurality Voting with Side-by-Side Pie Chart
import React from 'react';
/*eslint-disable*/
import { Check } from 'lucide-react';

export default function PluralityBallot({ 
  electionId,
  candidates = [],
  ballot,
  answers,
  currentAnswer,
  onAnswersChange,
  disabled = false,
  liveResults = null, // Pass live results data if available
}) {
  const candidatesList = candidates.length > 0 ? candidates : ballot?.questions?.[0]?.options || [];
  const currentAnswers = currentAnswer || answers || {};
  const questionId = candidates[0]?.questionId || ballot?.questions?.[0]?.id || 'candidates';
  const selectedCandidateId = currentAnswers[questionId];

  const handleCandidateSelect = (candidateId) => {
    if (disabled) return;
    onAnswersChange({
      [questionId]: candidateId,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT SIDE - BALLOT LISTING (Exact PDF Style) */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Sample General Ballot
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            Select ONE candidate
          </p>
        </div>

        {/* Candidate Table */}
        <div className="space-y-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-bold text-gray-700 border-r border-gray-300">
                  Candidate
                </th>
                <th className="text-center p-3 font-bold text-gray-700 w-20">
                  Vote
                </th>
              </tr>
            </thead>
            <tbody>
              {candidatesList.map((candidate, index) => {
                const isSelected = selectedCandidateId === candidate.id;
                const candidateLetter = String.fromCharCode(65 + index); // A, B, C...
                
                return (
                  <tr 
                    key={candidate.id}
                    className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleCandidateSelect(candidate.id)}
                  >
                    <td className="p-4 border-r border-gray-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                          {candidateLetter}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Candidate #{index + 1} ({candidateLetter})
                          </p>
                          <p className="text-sm text-gray-700">
                            {candidate.name || candidate.option_text}
                          </p>
                          {candidate.party && (
                            <p className="text-xs text-gray-500">({candidate.party})</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div 
                        className={`w-8 h-8 mx-auto border-2 rounded ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-600' 
                            : 'border-gray-400 bg-white'
                        } flex items-center justify-center cursor-pointer`}
                      >
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <p className="text-xs text-gray-600 italic text-center">
            The candidate with the most votes wins.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - PIE CHART (Exact PDF Style) */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
        <div className="mb-6 pb-4 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Live Results
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            Real-time vote distribution
          </p>
        </div>

        {/* Pie Chart Container */}
        <div className="flex items-center justify-center h-80">
          {liveResults ? (
            // Actual live results pie chart
            <div className="w-full h-full">
              {/* This will be replaced with actual chart component */}
              <LiveResultsPieChart data={liveResults} candidates={candidatesList} />
            </div>
          ) : (
            // Placeholder when no results yet
            <div className="text-center">
              <svg className="w-64 h-64 mx-auto" viewBox="0 0 100 100">
                {candidatesList.map((candidate, index) => {
                  const angle = (360 / candidatesList.length) * index;
                  const nextAngle = (360 / candidatesList.length) * (index + 1);
                  const largeArc = (nextAngle - angle) > 180 ? 1 : 0;
                  
                  const startX = 50 + 40 * Math.cos((angle * Math.PI) / 180);
                  const startY = 50 + 40 * Math.sin((angle * Math.PI) / 180);
                  const endX = 50 + 40 * Math.cos((nextAngle * Math.PI) / 180);
                  const endY = 50 + 40 * Math.sin((nextAngle * Math.PI) / 180);
                  
                  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
                  
                  return (
                    <path
                      key={candidate.id}
                      d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                      fill={colors[index % colors.length]}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="20" fill="white" />
              </svg>
              <p className="text-gray-500 mt-4">Waiting for votes...</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2">
          {candidatesList.map((candidate, index) => {
            const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
            const percentage = liveResults?.percentages?.[candidate.id] || 0;
            
            return (
              <div key={candidate.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {String.fromCharCode(65 + index)} - {candidate.name || candidate.option_text}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple Pie Chart Component
function LiveResultsPieChart({ data, candidates }) {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  
  let currentAngle = 0;
  
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      {candidates.map((candidate, index) => {
        const percentage = data?.percentages?.[candidate.id] || 0;
        const angle = (percentage / 100) * 360;
        const nextAngle = currentAngle + angle;
        const largeArc = angle > 180 ? 1 : 0;
        
        const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
        const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
        const endX = 50 + 40 * Math.cos((nextAngle * Math.PI) / 180);
        const endY = 50 + 40 * Math.sin((nextAngle * Math.PI) / 180);
        
        currentAngle = nextAngle;
        
        return (
          <path
            key={candidate.id}
            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
            fill={colors[index % colors.length]}
            stroke="white"
            strokeWidth="1"
          />
        );
      })}
      <circle cx="50" cy="50" r="20" fill="white" />
      <text x="50" y="55" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#374151">
        Total
      </text>
    </svg>
  );
}