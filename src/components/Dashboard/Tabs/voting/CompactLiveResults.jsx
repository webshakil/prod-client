// ============================================================================
// CompactLiveResults.jsx - PIE CHART WITH LEGEND (FIXED GAPS & COLORS)
// ============================================================================

import React from 'react';
import { RefreshCw, Users, Clock, PieChart as PieChartIcon } from 'lucide-react';
import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';

// Colors for pie chart - EXACT SAME used in both pie and legend
const COLORS = ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#70AD47', '#9E480E', '#997300', '#43682B'];

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================
const PieChart = ({ options, size = 160 }) => {
  const total = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 5;

  const createArcPath = (startAngle, endAngle, r) => {
    if (endAngle - startAngle >= 359.99) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    }
    const startRad = startAngle * (Math.PI / 180);
    const endRad = endAngle * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getLabelPosition = (startAngle, endAngle) => {
    const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
    const labelRadius = radius * 0.6;
    return {
      x: cx + labelRadius * Math.cos(midAngle),
      y: cy + labelRadius * Math.sin(midAngle)
    };
  };

  // Calculate segments
  let segments = [];
  let currentAngle = -90;

  if (total === 0) {
    // No votes - show equal segments
    const equalAngle = 360 / options.length;
    segments = options.map((opt, idx) => {
      const startAngle = currentAngle;
      currentAngle += equalAngle;
      return {
        ...opt,
        startAngle,
        endAngle: currentAngle,
        color: COLORS[idx % COLORS.length],
        percentage: 0
      };
    });
  } else {
    // Has votes - calculate actual percentages
    const percentages = options.map(opt => {
      const votes = opt.vote_count || 0;
      return (votes / total) * 100;
    });

    // Calculate angles - 0% gets just 2% visual (tiny sliver)
    segments = options.map((opt, idx) => {
      const actualPercentage = percentages[idx];
      // 0% = 2% visual (tiny), otherwise actual percentage
      const visualPercentage = actualPercentage === 0 ? 2 : actualPercentage;
      return {
        ...opt,
        color: COLORS[idx % COLORS.length],
        percentage: actualPercentage,
        visualPercentage
      };
    });

    // Normalize so total visual = 100%
    const totalVisual = segments.reduce((sum, s) => sum + s.visualPercentage, 0);
    const scale = 100 / totalVisual;

    segments = segments.map(seg => {
      const normalizedPercentage = seg.visualPercentage * scale;
      const angle = (normalizedPercentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        ...seg,
        startAngle,
        endAngle: currentAngle
      };
    });
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, idx) => {
        const sliceAngle = seg.endAngle - seg.startAngle;
        const labelPos = getLabelPosition(seg.startAngle, seg.endAngle);
        
        return (
          <g key={idx}>
            <path
              d={createArcPath(seg.startAngle, seg.endAngle, radius)}
              fill={seg.color}
              stroke="white"
              strokeWidth="2"
            />
            {/* Label inside pie slice - only if big enough */}
            {sliceAngle >= 50 && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="bold"
                fill="white"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
              >
                <tspan x={labelPos.x} dy="-0.4em">{seg.option_text}</tspan>
                <tspan x={labelPos.x} dy="1.2em">{seg.percentage.toFixed(0)}%</tspan>
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ============================================================================
// LEGEND COMPONENT
// ============================================================================
const Legend = ({ options, total }) => {
  return (
    <div className="flex flex-col justify-center gap-2">
      {options.map((opt, idx) => {
        const votes = opt.vote_count || 0;
        const percentage = total > 0 ? (votes / total) * 100 : 0;
        
        return (
          <div key={opt.id} className="flex items-center gap-2">
            {/* Color box - EXACT same color as pie */}
            <div 
              className="w-4 h-4 flex-shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-sm text-gray-700">
              {opt.option_text} <span className="font-semibold">{percentage.toFixed(0)}%</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CompactLiveResults({ electionId, questionId, electionStatus }) {
  const { data: results, refetch, isFetching } = useGetLiveResultsQuery(
    { electionId, questionId },
    { 
      pollingInterval: 5000,
      refetchOnMountOrArgChange: true,
      skip: !electionId,
    }
  );

  const apiData = results?.data?.questions ? results.data : (results?.data || results);
  const questions = apiData?.questions || [];
  const totalVotes = apiData?.totalVotes || 0;
  const isCompleted = electionStatus === 'completed' || apiData?.status === 'completed';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* HEADER */}
      <div className={`px-4 py-3 ${isCompleted ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {isCompleted ? 'Final Results' : 'Live Results'}
            </h3>
          </div>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-blue-100 text-sm mt-2">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</span>
          </div>
          {!isCompleted && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Voting in progress</span>
            </div>
          )}
        </div>
      </div>

      {/* PIE CHARTS WITH LEGENDS */}
      <div className="p-4 space-y-6">
        {questions.map((question, qIndex) => {
          const options = question.options || [];
          const questionTotal = options.reduce((sum, o) => sum + (o.vote_count || 0), 0);
          
          return (
            <div key={question.id}>
              {/* Question Title */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Q{qIndex + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {question.question_text}
                </span>
              </div>
              
              {/* Pie Chart + Legend Side by Side */}
              <div className="flex items-center justify-center gap-4">
                <PieChart options={options} size={150} />
                <Legend options={options} total={questionTotal} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
