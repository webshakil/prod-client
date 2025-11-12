// src/components/Dashboard/Tabs/voting/LiveResultsChart.jsx
// ✨ Real-time Results Visualization
import React, { useState } from 'react';
/*eslint-disable*/
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useGetLiveResultsQuery } from '../../../../redux/api/voting/ballotApi';
//import { useGetLiveResultsQuery } from '../../../../../redux/api/voting/ballotApi';

export default function LiveResultsChart({ 
  electionId,
  liveResultsVisible = false,
  votingType = 'plurality',
}) {
  const [chartType, setChartType] = useState('pie'); // pie, bar
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live results with polling
  const { 
    data: resultsData, 
    isLoading, 
    error,
    refetch 
  } = useGetLiveResultsQuery(electionId, {
    skip: !electionId || !liveResultsVisible,
    pollingInterval: autoRefresh ? 10000 : 0, // Poll every 10 seconds if auto-refresh enabled
  });

  if (!liveResultsVisible) {
    return (
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <EyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold mb-2">Live Results Hidden</p>
        <p className="text-gray-500 text-sm">
          Results will be visible after the election ends
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading live results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Failed to load results</p>
        <p className="text-red-600 text-sm">{error.data?.error || 'Unknown error'}</p>
      </div>
    );
  }

  const totalVotes = resultsData?.totalVotes || 0;
  const questions = resultsData?.questions || [];

  // Colors for charts
  const COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  const formatPercentage = (value, total) => {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Live Results</h2>
              <p className="text-blue-100 text-sm">Real-time voting data</p>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              autoRefresh 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                : 'bg-white bg-opacity-10 hover:bg-opacity-20'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">Total Votes</p>
            <p className="text-3xl font-black">{totalVotes.toLocaleString()}</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">Questions</p>
            <p className="text-3xl font-black">{questions.length}</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">Last Updated</p>
            <p className="text-sm font-semibold">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setChartType('pie')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            chartType === 'pie'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Pie Chart
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            chartType === 'bar'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📈 Bar Chart
        </button>
      </div>

      {/* Results for each question */}
      {questions.map((question, qIndex) => {
        const questionTotalVotes = question.options?.reduce((sum, opt) => sum + (opt.vote_count || 0), 0) || 0;

        // Prepare chart data
        const chartData = question.options?.map((option, index) => ({
          name: option.option_text,
          value: option.vote_count || 0,
          percentage: formatPercentage(option.vote_count, questionTotalVotes),
          color: COLORS[index % COLORS.length],
        })) || [];

        return (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-2">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {qIndex + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-800 flex-1">
                  {question.question_text}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Users className="w-4 h-4" />
                <span>{questionTotalVotes} total votes</span>
              </div>
            </div>

            {/* Chart */}
            <div className="mb-6">
              {chartType === 'pie' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percentage}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              {question.options?.map((option, oIndex) => {
                const percentage = (option.vote_count / questionTotalVotes) * 100 || 0;
                const isLeading = option.vote_count === Math.max(...question.options.map(o => o.vote_count || 0));

                return (
                  <div key={option.id} className="relative">
                    {/* Progress Bar */}
                    <div className="bg-gray-100 rounded-lg p-4 relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: oIndex * 0.1 }}
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ backgroundColor: COLORS[oIndex % COLORS.length] + '20' }}
                      />

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: COLORS[oIndex % COLORS.length] }}
                          />
                          <span className="font-semibold text-gray-800">
                            {option.option_text}
                          </span>
                          {isLeading && option.vote_count > 0 && (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                              🏆 Leading
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            {option.vote_count || 0} votes
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPercentage(option.vote_count, questionTotalVotes)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Last Updated */}
      <div className="text-center text-gray-500 text-sm">
        <p>Results update every 10 seconds</p>
        <button
          onClick={() => refetch()}
          className="text-blue-600 hover:underline mt-2 inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Now
        </button>
      </div>
    </div>
  );
}