// src/components/Dashboard/Tabs/voting/LivePieChart.jsx
// ✅ 100% PDF #10 STYLE - Beautiful Real-time Pie Chart
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function LivePieChart({ 
  candidates = [],
  liveResults = null,
  /*eslint-disable*/
  votingType = 'plurality',
}) {
  // PDF #10 exact colors
  const PDF_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Prepare chart data
  const chartData = candidates.map((candidate, index) => {
    let voteCount = 0;
    let percentage = 0;

    if (liveResults?.questions?.[0]?.options) {
      const option = liveResults.questions[0].options.find(
        opt => opt.id === candidate.id
      );
      voteCount = option?.vote_count || 0;
      percentage = parseFloat(option?.percentage || 0);
    }

    return {
      name: candidate.option_text,
      value: voteCount,
      percentage: percentage,
      color: PDF_COLORS[index % PDF_COLORS.length],
      letter: String.fromCharCode(65 + index), // A, B, C...
    };
  });

  const totalVotes = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label for pie slices
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border-2 border-gray-200">
          <p className="font-bold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} vote{data.value !== 1 ? 's' : ''} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border-3 border-gray-400 shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header - Exact PDF #10 Style */}
      <div className="bg-gray-100 border-b-3 border-gray-400 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900 text-center">
          {totalVotes > 0 ? 'Live Results' : 'Waiting for Votes shakil'}
        </h2>
        <p className="text-center text-gray-600 text-sm mt-1">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
        </p>
      </div>

      {/* Pie Chart */}
      <div className="flex-1 p-6">
        {totalVotes > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius="70%"
                innerRadius="45%"
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          // Placeholder when no votes
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-4 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {chartData.map((item, index) => {
                    const angle = (360 / chartData.length) * index;
                    const nextAngle = (360 / chartData.length) * (index + 1);
                    const largeArc = (nextAngle - angle) > 180 ? 1 : 0;
                    
                    const startX = 100 + 70 * Math.cos((angle * Math.PI) / 180);
                    const startY = 100 + 70 * Math.sin((angle * Math.PI) / 180);
                    const endX = 100 + 70 * Math.cos((nextAngle * Math.PI) / 180);
                    const endY = 100 + 70 * Math.sin((nextAngle * Math.PI) / 180);
                    
                    return (
                      <g key={index}>
                        <path
                          d={`M 100 100 L ${startX} ${startY} A 70 70 0 ${largeArc} 1 ${endX} ${endY} Z`}
                          fill={item.color}
                          opacity="0.3"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                  <circle cx="100" cy="100" r="45" fill="white" />
                  <text x="100" y="105" textAnchor="middle" className="text-lg font-bold fill-gray-400">
                    No votes yet
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend - Exact PDF #10 Style */}
      <div className="px-6 pb-6 border-t-2 border-gray-200">
        <div className="space-y-2 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.letter} - {item.name}
                </span>
              </div>
              <div className="text-right ml-3">
                <span className="text-sm font-bold text-gray-900">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({item.value})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time indicator */}
      {totalVotes > 0 && (
        <div className="bg-green-50 border-t-2 border-green-300 px-6 py-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-800">
              Live • Updates in real-time
            </span>
          </div>
        </div>
      )}
    </div>
  );
}