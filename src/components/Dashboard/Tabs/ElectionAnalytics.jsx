import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Download,
  Loader,
  Calendar,
  PieChart,
  MapPin
} from 'lucide-react';
import { 
  useGetElectionAnalyticsQuery,
  useLazyExportVotesQuery,
  useLazyExportResultsQuery
} from '../../../redux/api/voting/votingApi';
import { toast } from 'react-toastify';

export default function ElectionAnalytics({ electionId }) {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'day',
  });

  const { data: analyticsData, isLoading } = useGetElectionAnalyticsQuery({ 
    electionId, 
    ...dateRange 
  });
  
  const [exportVotes, { isLoading: exportingVotes }] = useLazyExportVotesQuery();
  const [exportResults, { isLoading: exportingResults }] = useLazyExportResultsQuery();

  const analytics = analyticsData?.data || {};

  const handleExportVotes = async (format = 'csv') => {
    try {
      const result = await exportVotes({ electionId, format }).unwrap();
      
      // Create download link
      const blob = new Blob([result], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `election-${electionId}-votes.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Votes exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export votes');
    }
  };

  const handleExportResults = async (format = 'csv') => {
    try {
      const result = await exportResults({ electionId, format }).unwrap();
      
      const blob = new Blob([result], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `election-${electionId}-results.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Results exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Election Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportVotes('csv')}
            disabled={exportingVotes}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {exportingVotes ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            Export Votes
          </button>
          <button
            onClick={() => handleExportResults('csv')}
            disabled={exportingResults}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {exportingResults ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            Export Results
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
            <select
              value={dateRange.groupBy}
              onChange={(e) => setDateRange({ ...dateRange, groupBy: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '', groupBy: 'day' })}
              className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Votes</p>
              <p className="text-3xl font-bold text-gray-800">{analytics.total_votes || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                +{analytics.votes_today || 0} today
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Participation Rate</p>
              <p className="text-3xl font-bold text-gray-800">
                {analytics.participation_rate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of eligible voters
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Unique Voters</p>
              <p className="text-3xl font-bold text-gray-800">{analytics.unique_voters || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                verified participants
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Revenue</p>
              <p className="text-3xl font-bold text-gray-800">
                ${analytics.total_revenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                from {analytics.paid_votes || 0} paid votes
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Vote Distribution by Question */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <PieChart size={20} />
          Vote Distribution by Question
        </h3>
        <div className="space-y-6">
          {analytics.questions_data?.map((question, index) => (
            <div key={index}>
              <p className="font-medium text-gray-800 mb-3">{question.question_text}</p>
              <div className="space-y-2">
                {question.options?.map((option) => {
                  const percentage = question.total_votes > 0 
                    ? (option.vote_count / question.total_votes * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={option.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{option.option_text}</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {option.vote_count} votes ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Series Chart */}
      {analytics.time_series && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Voting Trends Over Time
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.time_series.map((data, index) => {
              const maxVotes = Math.max(...analytics.time_series.map(d => d.votes));
              const height = (data.votes / maxVotes) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${data.votes} votes`}
                  />
                  <span className="text-xs text-gray-600 mt-2 rotate-45 origin-left">
                    {data.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Geographic Distribution */}
      {analytics.geographic_data && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {analytics.geographic_data.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{region.region_name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ 
                        width: `${(region.vote_count / analytics.total_votes * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                    {region.vote_count} ({(region.vote_count / analytics.total_votes * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}