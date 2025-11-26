// src/pages/admin/LiveAnalytics.jsx
// Enhanced with Pie Charts, World Map visualization, and Revenue Stats
import React, { useState } from 'react';
import {
  BarChart3, Users, Vote, Trophy, CreditCard, TrendingUp,
  RefreshCw, Calendar, Globe, Activity, Eye,
  CheckCircle, XCircle, Clock, Zap, DollarSign,
  UserCheck, FileText, Settings, ChevronDown, ChevronUp,
  MapPin, Percent, ArrowUpRight, Wallet
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

// RTK Query hooks
import {
  useGetPlatformReportQuery,
  useGetRealTimeStatsQuery,
  useGetRevenueReportQuery,
  useGetPlatformRevenueReportQuery, // ⭐ NEW: Added for Platform Revenue Report
} from '../../redux/api/analytics/platformAnalyticsApi';

// Country flags emoji mapping
const countryFlags = {
  'Germany': '🇩🇪', 'Japan': '🇯🇵', 'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧',
  'United States': '🇺🇸', 'India': '🇮🇳', 'China': '🇨🇳', 'Brazil': '🇧🇷', 'France': '🇫🇷',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Bangladesh': '🇧🇩', 'Pakistan': '🇵🇰', 'Nigeria': '🇳🇬',
  'Indonesia': '🇮🇩', 'Mexico': '🇲🇽', 'Russia': '🇷🇺', 'South Korea': '🇰🇷', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
};

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
const GENDER_COLORS = { 'male': '#3b82f6', 'female': '#ec4899', 'other': '#8b5cf6', 'Not Specified': '#9ca3af' };
const AGE_COLORS = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b0764', '#2e1065'];

export default function LiveAnalytics() {
  const [period, setPeriod] = useState(30);
  const [expandedSections, setExpandedSections] = useState({
    revenue: true, 
    platformRevenue: true, // ⭐ NEW: Added for Platform Revenue Report section
    overview: true, 
    users: true, 
    elections: true, 
    votes: true, 
    lottery: true, 
    subscriptions: true
  });

  const { data: reportData, isLoading: reportLoading, refetch: refetchReport, error: reportError } = useGetPlatformReportQuery({ period });
  const { data: realtimeData, refetch: refetchRealtime } = useGetRealTimeStatsQuery();
  const { refetch: refetchRevenue } = useGetRevenueReportQuery({ groupBy: 'month' });
  
  // ⭐ NEW: Platform Revenue Report hook
  const { data: platformRevenueData, isLoading: platformRevenueLoading, refetch: refetchPlatformRevenue } = useGetPlatformRevenueReportQuery({ period });
  const platformRevenue = platformRevenueData?.data;

  const report = reportData?.data;
  const realtime = realtimeData?.data;

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  
  // ⭐ UPDATED: Added refetchPlatformRevenue to handleRefresh
  const handleRefresh = () => { refetchReport(); refetchRealtime(); refetchRevenue(); refetchPlatformRevenue(); };

  const formatNumber = (num) => {
    if (!num) return '0';
    const n = parseFloat(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return '$' + parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const countryPieData = report?.users?.byCountry?.map((item) => ({
    name: item.country || 'Unknown', value: parseInt(item.count), flag: countryFlags[item.country] || '🌍'
  })) || [];

  const genderPieData = report?.users?.byGender?.map(item => ({
    name: item.gender === 'male' ? 'Male' : item.gender === 'female' ? 'Female' : item.gender,
    value: parseInt(item.count), color: GENDER_COLORS[item.gender] || '#9ca3af'
  })) || [];

  const agePieData = report?.users?.byAge?.map((item, idx) => ({
    name: item.age_group, value: parseInt(item.count), color: AGE_COLORS[idx % AGE_COLORS.length]
  })) || [];

  const electionStatusData = report?.elections?.stats ? [
    { name: 'Draft', value: parseInt(report.elections.stats.draft) || 0, color: '#9ca3af' },
    { name: 'Published', value: parseInt(report.elections.stats.published) || 0, color: '#3b82f6' },
    { name: 'Active', value: parseInt(report.elections.stats.active) || 0, color: '#10b981' },
    { name: 'Completed', value: parseInt(report.elections.stats.completed) || 0, color: '#8b5cf6' },
    { name: 'Cancelled', value: parseInt(report.elections.stats.cancelled) || 0, color: '#ef4444' },
  ].filter(item => item.value > 0) : [];

  const votingTypeData = report?.elections?.stats ? [
    { name: 'Plurality', value: parseInt(report.elections.stats.plurality) || 0, color: '#3b82f6' },
    { name: 'Ranked Choice', value: parseInt(report.elections.stats.ranked_choice) || 0, color: '#8b5cf6' },
    { name: 'Approval', value: parseInt(report.elections.stats.approval) || 0, color: '#10b981' },
  ].filter(item => item.value > 0) : [];

  const totalParticipationFees = parseFloat(report?.elections?.stats?.total_lottery_prize_pool || 0);
  const paidElections = parseInt(report?.elections?.stats?.paid_elections || 0);
  const freeElections = parseInt(report?.elections?.stats?.free_elections || 0);
  const activeSubscriptions = parseInt(report?.overview?.active_subscriptions || 0);
  const estimatedSubscriptionRevenue = activeSubscriptions * 29;
  const totalUsageAmount = parseFloat(report?.subscriptions?.stats?.total_usage_amount || 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.total || 1;
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} ({((payload[0].value / total) * 100).toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  if (reportLoading && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Failed to load analytics</p>
          <p className="text-red-500 text-sm mt-2">{reportError?.data?.message || 'Unknown error'}</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Activity className="w-8 h-8" />Live Platform Analytics</h1>
            <p className="text-purple-200 mt-1">Real-time insights and comprehensive platform statistics</p>
            {report?.generatedAt && <p className="text-xs text-purple-300 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />Last updated: {new Date(report.generatedAt).toLocaleString()}</p>}
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))} className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50">
              <option value={7} className="text-gray-900">Last 7 days</option>
              <option value={30} className="text-gray-900">Last 30 days</option>
              <option value={90} className="text-gray-900">Last 90 days</option>
              <option value={365} className="text-gray-900">Last year</option>
            </select>
            <button onClick={handleRefresh} disabled={reportLoading} className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition font-medium disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>
        </div>
        {realtime && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="text-center"><div className="flex items-center justify-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /><p className="text-3xl font-bold">{realtime.stats?.active_elections || 0}</p></div><p className="text-xs text-purple-200">Active Elections</p></div>
            <div className="text-center"><p className="text-3xl font-bold">{realtime.stats?.published_elections || 0}</p><p className="text-xs text-purple-200">Published</p></div>
            <div className="text-center"><p className="text-3xl font-bold text-green-400">{realtime.stats?.votes_last_hour || 0}</p><p className="text-xs text-purple-200">Votes (1h)</p></div>
            <div className="text-center"><p className="text-3xl font-bold">{realtime.stats?.votes_last_24h || 0}</p><p className="text-xs text-purple-200">Votes (24h)</p></div>
            <div className="text-center"><p className="text-3xl font-bold text-blue-400">{realtime.stats?.new_users_24h || 0}</p><p className="text-xs text-purple-200">New Users (24h)</p></div>
            <div className="text-center"><p className="text-3xl font-bold text-pink-400">{realtime.stats?.pending_lottery_draws || 0}</p><p className="text-xs text-purple-200">Pending Draws</p></div>
          </div>
        )}
      </div>

      {/* REVENUE SECTION */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <button onClick={() => toggleSection('revenue')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-3"><DollarSign className="w-6 h-6" /><span className="font-bold text-lg">Platform Revenue & Earnings</span></div>
          {expandedSections.revenue ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.revenue && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between mb-3"><Wallet className="w-10 h-10 text-emerald-600 p-2 bg-emerald-100 rounded-lg" /><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />Active</span></div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(estimatedSubscriptionRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">Est. Monthly Subscription</p>
                <p className="text-xs text-emerald-600 mt-2">{activeSubscriptions} active subscribers</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between mb-3"><Trophy className="w-10 h-10 text-purple-600 p-2 bg-purple-100 rounded-lg" /></div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalParticipationFees)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Lottery Prize Pool</p>
                <p className="text-xs text-purple-600 mt-2">{report?.overview?.lottery_elections || 0} lottery elections</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between mb-3"><CreditCard className="w-10 h-10 text-blue-600 p-2 bg-blue-100 rounded-lg" /></div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalUsageAmount)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Usage Revenue</p>
                <p className="text-xs text-blue-600 mt-2">Pay-as-you-go earnings</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between mb-3"><Percent className="w-10 h-10 text-orange-600 p-2 bg-orange-100 rounded-lg" /></div>
                <p className="text-3xl font-bold text-gray-900">{paidElections}</p>
                <p className="text-sm text-gray-500 mt-1">Paid Elections</p>
                <p className="text-xs text-orange-600 mt-2">{freeElections} free elections</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600" />Subscription Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg"><span className="text-gray-700">Active Subscriptions</span><span className="font-bold text-emerald-600 text-lg">{formatNumber(report?.subscriptions?.stats?.active)}</span></div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg"><span className="text-gray-700">Recurring Plans</span><span className="font-bold text-blue-600 text-lg">{formatNumber(report?.subscriptions?.stats?.recurring_count)}</span></div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg"><span className="text-gray-700">Pay-as-you-go</span><span className="font-bold text-purple-600 text-lg">{formatNumber(report?.subscriptions?.stats?.pay_as_you_go_count)}</span></div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg"><span className="text-gray-700">Auto-renew Enabled</span><span className="font-bold text-green-600 text-lg">{formatNumber(report?.subscriptions?.stats?.auto_renew_enabled)}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" />Payment Gateway Distribution</h4>
                {report?.subscriptions?.byGateway?.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={report.subscriptions.byGateway.map((g) => ({ ...g, name: g.gateway, value: parseInt(g.count), total: report.subscriptions.byGateway.reduce((a, b) => a + parseInt(b.count), 0) }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                          {report.subscriptions.byGateway.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (<div className="h-48 flex items-center justify-center text-gray-400">No gateway data</div>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ⭐ NEW: PLATFORM REVENUE REPORT - Subscription & Platform Fee Breakdown */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <button onClick={() => toggleSection('platformRevenue')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <span className="font-bold text-lg">Platform Revenue Report</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Subscriptions + Platform Fees</span>
          </div>
          {expandedSections.platformRevenue ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.platformRevenue && (
          <div className="p-6 space-y-6">
            {platformRevenueLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
                <span className="ml-3 text-gray-600">Loading revenue data...</span>
              </div>
            ) : platformRevenue ? (
              <>
                {/* Total Revenue Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Platform Revenue */}
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="w-12 h-12 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">All Time</span>
                    </div>
                    <p className="text-4xl font-bold">{formatCurrency(platformRevenue.summary?.total_platform_revenue)}</p>
                    <p className="text-amber-100 mt-2">Total Platform Revenue</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm text-amber-100">This Period ({period}d): {formatCurrency(platformRevenue.summary?.revenue_this_period)}</p>
                    </div>
                  </div>

                  {/* Subscription Revenue */}
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <CreditCard className="w-12 h-12 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{platformRevenue.summary?.subscription_percentage}%</span>
                    </div>
                    <p className="text-4xl font-bold">{formatCurrency(platformRevenue.summary?.total_subscription_revenue)}</p>
                    <p className="text-purple-100 mt-2">Subscription Revenue</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm text-purple-100">This Period: {formatCurrency(platformRevenue.summary?.subscription_revenue_period)}</p>
                    </div>
                  </div>

                  {/* Platform Fee Revenue */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Percent className="w-12 h-12 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{platformRevenue.summary?.platform_fee_percentage}%</span>
                    </div>
                    <p className="text-4xl font-bold">{formatCurrency(platformRevenue.summary?.total_platform_fee_revenue)}</p>
                    <p className="text-emerald-100 mt-2">Platform Fee Revenue</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm text-emerald-100">This Period: {formatCurrency(platformRevenue.summary?.platform_fee_revenue_period)}</p>
                    </div>
                  </div>
                </div>

                {/* Revenue Distribution Pie Chart & Subscription Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Revenue Split */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-600" />
                      Revenue Distribution
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Subscriptions', value: parseFloat(platformRevenue.summary?.total_subscription_revenue || 0), color: '#8b5cf6' },
                              { name: 'Platform Fees', value: parseFloat(platformRevenue.summary?.total_platform_fee_revenue || 0), color: '#10b981' }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subscription Stats */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      Subscription Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
                        <span className="text-gray-700 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Active Subscriptions</span>
                        <span className="font-bold text-green-600 text-lg">{formatNumber(platformRevenue.subscriptions?.stats?.active_subscriptions)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Total Subscriptions</span>
                        <span className="font-bold text-gray-700 text-lg">{formatNumber(platformRevenue.subscriptions?.stats?.total_subscriptions)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Revenue (30d)</span>
                        <span className="font-bold text-purple-600 text-lg">{formatCurrency(platformRevenue.subscriptions?.stats?.revenue_last_30_days)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Revenue (7d)</span>
                        <span className="font-bold text-blue-600 text-lg">{formatCurrency(platformRevenue.subscriptions?.stats?.revenue_last_7_days)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Revenue (Today)</span>
                        <span className="font-bold text-amber-600 text-lg">{formatCurrency(platformRevenue.subscriptions?.stats?.revenue_today)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Fee Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Platform Fee Stats */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-emerald-600" />
                      Platform Fee Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
                        <span className="text-gray-700 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Successful Payments</span>
                        <span className="font-bold text-green-600 text-lg">{formatNumber(platformRevenue.platformFees?.stats?.successful_payments)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-transparent rounded-lg">
                        <span className="text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" />Pending Payments</span>
                        <span className="font-bold text-yellow-600 text-lg">{formatNumber(platformRevenue.platformFees?.stats?.pending_payments)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Platform Fee (30d)</span>
                        <span className="font-bold text-emerald-600 text-lg">{formatCurrency(platformRevenue.platformFees?.stats?.platform_fee_last_30_days)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Platform Fee (7d)</span>
                        <span className="font-bold text-teal-600 text-lg">{formatCurrency(platformRevenue.platformFees?.stats?.platform_fee_last_7_days)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-transparent rounded-lg">
                        <span className="text-gray-700">Platform Fee (Today)</span>
                        <span className="font-bold text-cyan-600 text-lg">{formatCurrency(platformRevenue.platformFees?.stats?.platform_fee_today)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue by Gateway */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      Revenue by Payment Gateway
                    </h4>
                    {platformRevenue.platformFees?.byGateway?.length > 0 ? (
                      <div className="space-y-3">
                        {platformRevenue.platformFees.byGateway.map((gateway, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                                gateway.gateway?.toLowerCase() === 'stripe' ? 'bg-purple-500' :
                                gateway.gateway?.toLowerCase() === 'paddle' ? 'bg-blue-500' :
                                gateway.gateway?.toLowerCase() === 'paypal' ? 'bg-blue-600' :
                                'bg-gray-500'
                              }`}>
                                {gateway.gateway?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{gateway.gateway || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{gateway.payment_count} payments</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">{formatCurrency(gateway.total_platform_fee)}</p>
                              <p className="text-xs text-gray-500">of {formatCurrency(gateway.total_amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No payment gateway data</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Elections by Platform Fee */}
                {platformRevenue.platformFees?.topElections?.length > 0 && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-600" />
                      Top Elections by Platform Fee Revenue
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Election</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-600">Payments</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">Total Amount</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">Platform Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {platformRevenue.platformFees.topElections.map((election, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                                  idx === 1 ? 'bg-gray-200 text-gray-700' :
                                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900 truncate max-w-[250px]">{election.election_title || `Election #${election.election_id}`}</p>
                                <p className="text-xs text-gray-500">ID: {election.election_id}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {election.payment_count}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(election.total_amount)}</td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(election.total_platform_fee)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2">
                          <tr>
                            <td colSpan="3" className="px-4 py-3 font-bold text-gray-700">Total (Top 10)</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-700">
                              {formatCurrency(platformRevenue.platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0))}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                              {formatCurrency(platformRevenue.platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_platform_fee || 0), 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Revenue Trend Chart */}
                {(platformRevenue.subscriptions?.trend?.length > 0 || platformRevenue.platformFees?.trend?.length > 0) && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Revenue Trend (Last {period} Days)
                    </h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={(() => {
                            // Merge subscription and platform fee trends
                            const allDates = new Set([
                              ...(platformRevenue.subscriptions?.trend || []).map(t => t.date),
                              ...(platformRevenue.platformFees?.trend || []).map(t => t.date)
                            ]);
                            return Array.from(allDates).sort().map(date => {
                              const subData = platformRevenue.subscriptions?.trend?.find(t => t.date === date);
                              const feeData = platformRevenue.platformFees?.trend?.find(t => t.date === date);
                              return {
                                date,
                                subscriptions: parseFloat(subData?.revenue || 0),
                                platformFees: parseFloat(feeData?.platform_fee || 0)
                              };
                            });
                          })()}
                        >
                          <defs>
                            <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                          <Tooltip
                            labelFormatter={formatDate}
                            formatter={(value, name) => [formatCurrency(value), name === 'subscriptions' ? 'Subscriptions' : 'Platform Fees']}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#8b5cf6" fill="url(#colorSubs)" strokeWidth={2} />
                          <Area type="monotone" dataKey="platformFees" name="Platform Fees" stroke="#10b981" fill="url(#colorFees)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No revenue data available</p>
                <p className="text-sm mt-2">Revenue data will appear once transactions are recorded</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ⭐ END NEW PLATFORM REVENUE REPORT SECTION */}

      {/* PLATFORM OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg"><Users className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.total_users)}</p><p className="text-sm text-blue-100">Total Users</p></div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg"><FileText className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.total_elections)}</p><p className="text-sm text-green-100">Total Elections</p></div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg"><Vote className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.total_votes)}</p><p className="text-sm text-purple-100">Total Votes</p></div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-5 text-white shadow-lg"><CreditCard className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.active_subscriptions)}</p><p className="text-sm text-yellow-100">Active Subs</p></div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-5 text-white shadow-lg"><Trophy className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.lottery_elections)}</p><p className="text-sm text-pink-100">Lottery Elections</p></div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 text-white shadow-lg"><DollarSign className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatCurrency(report?.overview?.total_prize_pool)}</p><p className="text-sm text-emerald-100">Prize Pool</p></div>
      </div>
      {/* USER ANALYTICS - WORLD DOMINATION */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <button onClick={() => toggleSection('users')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3"><Globe className="w-6 h-6" /><span className="font-bold text-lg">User Analytics - Global Reach</span></div>
          {expandedSections.users ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.users && report?.users && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border"><p className="text-4xl font-bold text-gray-900">{formatNumber(report.users.stats?.total_registered)}</p><p className="text-sm text-gray-600 mt-1">Total Registered</p></div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200"><p className="text-4xl font-bold text-blue-700">{formatNumber(report.users.stats?.new_users_period)}</p><p className="text-sm text-blue-600 mt-1">New ({period}d)</p></div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center border border-green-200"><p className="text-4xl font-bold text-green-700">{formatNumber(report.users.stats?.new_users_week)}</p><p className="text-sm text-green-600 mt-1">This Week</p></div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center border border-purple-200"><p className="text-4xl font-bold text-purple-700">{formatNumber(report.users.stats?.new_users_today)}</p><p className="text-sm text-purple-600 mt-1">Today</p></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Country Distribution */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
                <h4 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" />Global Distribution</h4>
                <div className="space-y-3">
                  {countryPieData.length > 0 ? countryPieData.map((country, idx) => {
                    const total = countryPieData.reduce((a, b) => a + b.value, 0);
                    const percentage = ((country.value / total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1"><span>{country.name}</span><span className="text-blue-400">{country.value} ({percentage}%)</span></div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${percentage}%` }} /></div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-slate-400 text-center py-4">No country data</p>}
                </div>
              </div>
              {/* Gender Distribution */}
              <div className="bg-white rounded-xl p-5 border">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-pink-600" />Gender Distribution</h4>
                {genderPieData.length > 0 ? (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={genderPieData.map(g => ({ ...g, total: genderPieData.reduce((a, b) => a + b.value, 0) }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {genderPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-52 flex items-center justify-center text-gray-400">No gender data</div>}
              </div>
              {/* Age Distribution */}
              <div className="bg-white rounded-xl p-5 border">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" />Age Distribution</h4>
                {agePieData.length > 0 ? (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={agePieData.map(a => ({ ...a, total: agePieData.reduce((x, y) => x + y.value, 0) }))} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                          {agePieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-52 flex items-center justify-center text-gray-400">No age data</div>}
              </div>
            </div>
            {/* Registration Trend */}
            {report.users.trend?.length > 0 && (
              <div className="bg-white rounded-xl p-5 border">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600" />Registration Trend</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.users.trend.map(t => ({ ...t, count: parseInt(t.count) }))}>
                      <defs><linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip labelFormatter={formatDate} />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorUsers)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ELECTIONS ANALYTICS */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <button onClick={() => toggleSection('elections')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3"><FileText className="w-6 h-6" /><span className="font-bold text-lg">Election Analytics</span></div>
          {expandedSections.elections ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.elections && report?.elections && (
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Election Status Pie */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-4">Election Status</h4>
                {electionStatusData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={electionStatusData.map(e => ({ ...e, total: electionStatusData.reduce((a, b) => a + b.value, 0) }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {electionStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-64 flex items-center justify-center text-gray-400">No election data</div>}
              </div>
              {/* Voting Type Pie */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-4">Voting Methods</h4>
                {votingTypeData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={votingTypeData.map(v => ({ ...v, total: votingTypeData.reduce((a, b) => a + b.value, 0) }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {votingTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-64 flex items-center justify-center text-gray-400">No voting type data</div>}
              </div>
            </div>
            {/* Features Usage */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Feature Usage</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100"><Trophy className="w-6 h-6 text-pink-600 mx-auto mb-2" /><p className="text-2xl font-bold text-pink-800">{report.elections.stats?.lottery_enabled_count || 0}</p><p className="text-xs text-pink-600">Lottery</p></div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100"><Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-800">{report.elections.stats?.biometric_required_count || 0}</p><p className="text-xs text-blue-600">Biometric</p></div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100"><UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-800">{report.elections.stats?.anonymous_voting_count || 0}</p><p className="text-xs text-purple-600">Anonymous</p></div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100"><Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" /><p className="text-2xl font-bold text-orange-800">{report.elections.stats?.video_required_count || 0}</p><p className="text-xs text-orange-600">Video Req.</p></div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100"><BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold text-green-800">{report.elections.stats?.live_results_count || 0}</p><p className="text-xs text-green-600">Live Results</p></div>
                <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-100"><Settings className="w-6 h-6 text-cyan-600 mx-auto mb-2" /><p className="text-2xl font-bold text-cyan-800">{report.elections.stats?.vote_editing_count || 0}</p><p className="text-xs text-cyan-600">Edit Votes</p></div>
              </div>
            </div>
            {/* Top Elections Table */}
            {report.elections.topElections?.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-4">Top Elections</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="px-3 py-3 text-left font-medium text-gray-600">Title</th><th className="px-3 py-3 text-center font-medium text-gray-600">Status</th><th className="px-3 py-3 text-right font-medium text-gray-600">Votes</th><th className="px-3 py-3 text-right font-medium text-gray-600">Views</th><th className="px-3 py-3 text-center font-medium text-gray-600">Features</th></tr></thead>
                    <tbody className="divide-y">
                      {report.elections.topElections.map((election) => (
                        <tr key={election.id} className="hover:bg-white transition">
                          <td className="px-3 py-3 font-medium truncate max-w-[250px]">{election.title}</td>
                          <td className="px-3 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${election.status === 'active' ? 'bg-green-100 text-green-700' : election.status === 'published' ? 'bg-blue-100 text-blue-700' : election.status === 'completed' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{election.status}</span></td>
                          <td className="px-3 py-3 text-right font-bold text-purple-600">{election.vote_count || 0}</td>
                          <td className="px-3 py-3 text-right text-gray-600">{election.view_count || 0}</td>
                          <td className="px-3 py-3 text-center"><div className="flex justify-center gap-1">{election.lottery_enabled && <Trophy className="w-4 h-4 text-pink-500" />}{election.is_free ? <span className="text-xs bg-green-100 text-green-600 px-1 rounded">Free</span> : <span className="text-xs bg-yellow-100 text-yellow-600 px-1 rounded">Paid</span>}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VOTE & LOTTERY ANALYTICS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vote Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white"><div className="flex items-center gap-3"><Vote className="w-6 h-6" /><span className="font-bold text-lg">Vote Analytics</span></div></div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-purple-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-purple-900">{formatNumber(report?.votes?.stats?.total_votes)}</p><p className="text-xs text-purple-600">Total</p></div>
              <div className="bg-green-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-green-900">{formatNumber(report?.votes?.stats?.valid_votes)}</p><p className="text-xs text-green-600">Valid</p></div>
              <div className="bg-blue-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-blue-900">{formatNumber(report?.votes?.stats?.unique_voters)}</p><p className="text-xs text-blue-600">Unique Voters</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold">{formatNumber(report?.votes?.stats?.votes_period)}</p><p className="text-xs text-gray-500">Last {period}d</p></div>
              <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold">{formatNumber(report?.votes?.stats?.votes_week)}</p><p className="text-xs text-gray-500">This Week</p></div>
              <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold">{formatNumber(report?.votes?.stats?.votes_today)}</p><p className="text-xs text-gray-500">Today</p></div>
            </div>
          </div>
        </div>
        {/* Lottery Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white"><div className="flex items-center gap-3"><Trophy className="w-6 h-6" /><span className="font-bold text-lg">Lottery Analytics</span></div></div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-pink-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-pink-900">{formatNumber(report?.lottery?.stats?.total_draws)}</p><p className="text-xs text-pink-600">Total Draws</p></div>
              <div className="bg-green-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-green-900">{formatNumber(report?.lottery?.stats?.completed_draws)}</p><p className="text-xs text-green-600">Completed</p></div>
              <div className="bg-purple-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-purple-900">{formatNumber(report?.lottery?.stats?.total_winner_slots)}</p><p className="text-xs text-purple-600">Winners</p></div>
            </div>
            {report?.lottery?.byRewardType?.length > 0 && (
              <div className="space-y-2">
                {report.lottery.byRewardType.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 rounded-lg">
                    <span className="text-sm font-medium capitalize">{item.lottery_reward_type?.replace('_', ' ')}</span>
                    <div className="text-right"><span className="font-bold text-purple-700">{item.count} elections</span><span className="text-xs text-gray-500 ml-2">({formatCurrency(item.total_prize_pool)})</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      {realtime?.recentVotes?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white"><div className="flex items-center gap-3"><Activity className="w-6 h-6" /><span className="font-bold text-lg">Recent Activity</span></div></div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {realtime.recentVotes.map((vote, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                  <div className={`w-3 h-3 rounded-full ${vote.anonymous ? 'bg-purple-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{vote.election_title}</p><p className="text-xs text-gray-500">{new Date(vote.created_at).toLocaleString()}</p></div>
                  {vote.anonymous && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Anon</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//last workable code only to add revenue report above code
// // src/pages/admin/LiveAnalytics.jsx
// // Enhanced with Pie Charts, World Map visualization, and Revenue Stats
// import React, { useState } from 'react';
// import {
//   BarChart3, Users, Vote, Trophy, CreditCard, TrendingUp,
//   RefreshCw, Calendar, Globe, Activity, Eye,
//   CheckCircle, XCircle, Clock, Zap, DollarSign,
//   UserCheck, FileText, Settings, ChevronDown, ChevronUp,
//   MapPin, Percent, ArrowUpRight, Wallet
// } from 'lucide-react';
// import {
//   PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
//   AreaChart, Area, XAxis, YAxis, CartesianGrid
// } from 'recharts';

// // RTK Query hooks
// import {
//   useGetPlatformReportQuery,
//   useGetRealTimeStatsQuery,
//   useGetRevenueReportQuery,
// } from '../../redux/api/analytics/platformAnalyticsApi';

// // Country flags emoji mapping
// const countryFlags = {
//   'Germany': '🇩🇪', 'Japan': '🇯🇵', 'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧',
//   'United States': '🇺🇸', 'India': '🇮🇳', 'China': '🇨🇳', 'Brazil': '🇧🇷', 'France': '🇫🇷',
//   'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Bangladesh': '🇧🇩', 'Pakistan': '🇵🇰', 'Nigeria': '🇳🇬',
//   'Indonesia': '🇮🇩', 'Mexico': '🇲🇽', 'Russia': '🇷🇺', 'South Korea': '🇰🇷', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
// };

// const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
// const GENDER_COLORS = { 'male': '#3b82f6', 'female': '#ec4899', 'other': '#8b5cf6', 'Not Specified': '#9ca3af' };
// const AGE_COLORS = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b0764', '#2e1065'];

// export default function LiveAnalytics() {
//   const [period, setPeriod] = useState(30);
//   const [expandedSections, setExpandedSections] = useState({
//     revenue: true, overview: true, users: true, elections: true, votes: true, lottery: true, subscriptions: true
//   });

//   const { data: reportData, isLoading: reportLoading, refetch: refetchReport, error: reportError } = useGetPlatformReportQuery({ period });
//   const { data: realtimeData, refetch: refetchRealtime } = useGetRealTimeStatsQuery();
//   const { refetch: refetchRevenue } = useGetRevenueReportQuery({ groupBy: 'month' });

//   const report = reportData?.data;
//   const realtime = realtimeData?.data;

//   const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   const handleRefresh = () => { refetchReport(); refetchRealtime(); refetchRevenue(); };

//   const formatNumber = (num) => {
//     if (!num) return '0';
//     const n = parseFloat(num);
//     if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
//     if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
//     return n.toLocaleString();
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return '$0.00';
//     return '$' + parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   const formatDate = (date) => {
//     if (!date) return '-';
//     return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   };

//   const countryPieData = report?.users?.byCountry?.map((item) => ({
//     name: item.country || 'Unknown', value: parseInt(item.count), flag: countryFlags[item.country] || '🌍'
//   })) || [];

//   const genderPieData = report?.users?.byGender?.map(item => ({
//     name: item.gender === 'male' ? 'Male' : item.gender === 'female' ? 'Female' : item.gender,
//     value: parseInt(item.count), color: GENDER_COLORS[item.gender] || '#9ca3af'
//   })) || [];

//   const agePieData = report?.users?.byAge?.map((item, idx) => ({
//     name: item.age_group, value: parseInt(item.count), color: AGE_COLORS[idx % AGE_COLORS.length]
//   })) || [];

//   const electionStatusData = report?.elections?.stats ? [
//     { name: 'Draft', value: parseInt(report.elections.stats.draft) || 0, color: '#9ca3af' },
//     { name: 'Published', value: parseInt(report.elections.stats.published) || 0, color: '#3b82f6' },
//     { name: 'Active', value: parseInt(report.elections.stats.active) || 0, color: '#10b981' },
//     { name: 'Completed', value: parseInt(report.elections.stats.completed) || 0, color: '#8b5cf6' },
//     { name: 'Cancelled', value: parseInt(report.elections.stats.cancelled) || 0, color: '#ef4444' },
//   ].filter(item => item.value > 0) : [];

//   const votingTypeData = report?.elections?.stats ? [
//     { name: 'Plurality', value: parseInt(report.elections.stats.plurality) || 0, color: '#3b82f6' },
//     { name: 'Ranked Choice', value: parseInt(report.elections.stats.ranked_choice) || 0, color: '#8b5cf6' },
//     { name: 'Approval', value: parseInt(report.elections.stats.approval) || 0, color: '#10b981' },
//   ].filter(item => item.value > 0) : [];

//   const totalParticipationFees = parseFloat(report?.elections?.stats?.total_lottery_prize_pool || 0);
//   const paidElections = parseInt(report?.elections?.stats?.paid_elections || 0);
//   const freeElections = parseInt(report?.elections?.stats?.free_elections || 0);
//   const activeSubscriptions = parseInt(report?.overview?.active_subscriptions || 0);
//   const estimatedSubscriptionRevenue = activeSubscriptions * 29;
//   const totalUsageAmount = parseFloat(report?.subscriptions?.stats?.total_usage_amount || 0);

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const total = payload[0].payload.total || 1;
//       return (
//         <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
//           <p className="font-medium">{payload[0].name}</p>
//           <p className="text-sm text-gray-600">{payload[0].value} ({((payload[0].value / total) * 100).toFixed(1)}%)</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   if (reportLoading && !report) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   if (reportError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center bg-red-50 p-8 rounded-lg">
//           <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 font-medium">Failed to load analytics</p>
//           <p className="text-red-500 text-sm mt-2">{reportError?.data?.message || 'Unknown error'}</p>
//           <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-8">
//       {/* HEADER */}
//       <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//           <div>
//             <h1 className="text-3xl font-bold flex items-center gap-3"><Activity className="w-8 h-8" />Live Platform Analytics</h1>
//             <p className="text-purple-200 mt-1">Real-time insights and comprehensive platform statistics</p>
//             {report?.generatedAt && <p className="text-xs text-purple-300 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />Last updated: {new Date(report.generatedAt).toLocaleString()}</p>}
//           </div>
//           <div className="flex items-center gap-3">
//             <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))} className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50">
//               <option value={7} className="text-gray-900">Last 7 days</option>
//               <option value={30} className="text-gray-900">Last 30 days</option>
//               <option value={90} className="text-gray-900">Last 90 days</option>
//               <option value={365} className="text-gray-900">Last year</option>
//             </select>
//             <button onClick={handleRefresh} disabled={reportLoading} className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition font-medium disabled:opacity-50">
//               <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />Refresh
//             </button>
//           </div>
//         </div>
//         {realtime && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-white/20">
//             <div className="text-center"><div className="flex items-center justify-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /><p className="text-3xl font-bold">{realtime.stats?.active_elections || 0}</p></div><p className="text-xs text-purple-200">Active Elections</p></div>
//             <div className="text-center"><p className="text-3xl font-bold">{realtime.stats?.published_elections || 0}</p><p className="text-xs text-purple-200">Published</p></div>
//             <div className="text-center"><p className="text-3xl font-bold text-green-400">{realtime.stats?.votes_last_hour || 0}</p><p className="text-xs text-purple-200">Votes (1h)</p></div>
//             <div className="text-center"><p className="text-3xl font-bold">{realtime.stats?.votes_last_24h || 0}</p><p className="text-xs text-purple-200">Votes (24h)</p></div>
//             <div className="text-center"><p className="text-3xl font-bold text-blue-400">{realtime.stats?.new_users_24h || 0}</p><p className="text-xs text-purple-200">New Users (24h)</p></div>
//             <div className="text-center"><p className="text-3xl font-bold text-pink-400">{realtime.stats?.pending_lottery_draws || 0}</p><p className="text-xs text-purple-200">Pending Draws</p></div>
//           </div>
//         )}
//       </div>

//       {/* REVENUE SECTION */}
//       <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
//         <button onClick={() => toggleSection('revenue')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
//           <div className="flex items-center gap-3"><DollarSign className="w-6 h-6" /><span className="font-bold text-lg">Platform Revenue & Earnings</span></div>
//           {expandedSections.revenue ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
//         {expandedSections.revenue && (
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
//                 <div className="flex items-center justify-between mb-3"><Wallet className="w-10 h-10 text-emerald-600 p-2 bg-emerald-100 rounded-lg" /><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />Active</span></div>
//                 <p className="text-3xl font-bold text-gray-900">{formatCurrency(estimatedSubscriptionRevenue)}</p>
//                 <p className="text-sm text-gray-500 mt-1">Est. Monthly Subscription</p>
//                 <p className="text-xs text-emerald-600 mt-2">{activeSubscriptions} active subscribers</p>
//               </div>
//               <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
//                 <div className="flex items-center justify-between mb-3"><Trophy className="w-10 h-10 text-purple-600 p-2 bg-purple-100 rounded-lg" /></div>
//                 <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalParticipationFees)}</p>
//                 <p className="text-sm text-gray-500 mt-1">Total Lottery Prize Pool</p>
//                 <p className="text-xs text-purple-600 mt-2">{report?.overview?.lottery_elections || 0} lottery elections</p>
//               </div>
//               <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
//                 <div className="flex items-center justify-between mb-3"><CreditCard className="w-10 h-10 text-blue-600 p-2 bg-blue-100 rounded-lg" /></div>
//                 <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalUsageAmount)}</p>
//                 <p className="text-sm text-gray-500 mt-1">Total Usage Revenue</p>
//                 <p className="text-xs text-blue-600 mt-2">Pay-as-you-go earnings</p>
//               </div>
//               <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
//                 <div className="flex items-center justify-between mb-3"><Percent className="w-10 h-10 text-orange-600 p-2 bg-orange-100 rounded-lg" /></div>
//                 <p className="text-3xl font-bold text-gray-900">{paidElections}</p>
//                 <p className="text-sm text-gray-500 mt-1">Paid Elections</p>
//                 <p className="text-xs text-orange-600 mt-2">{freeElections} free elections</p>
//               </div>
//             </div>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="bg-white rounded-xl p-5 shadow-sm">
//                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600" />Subscription Breakdown</h4>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg"><span className="text-gray-700">Active Subscriptions</span><span className="font-bold text-emerald-600 text-lg">{formatNumber(report?.subscriptions?.stats?.active)}</span></div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg"><span className="text-gray-700">Recurring Plans</span><span className="font-bold text-blue-600 text-lg">{formatNumber(report?.subscriptions?.stats?.recurring_count)}</span></div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg"><span className="text-gray-700">Pay-as-you-go</span><span className="font-bold text-purple-600 text-lg">{formatNumber(report?.subscriptions?.stats?.pay_as_you_go_count)}</span></div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg"><span className="text-gray-700">Auto-renew Enabled</span><span className="font-bold text-green-600 text-lg">{formatNumber(report?.subscriptions?.stats?.auto_renew_enabled)}</span></div>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl p-5 shadow-sm">
//                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" />Payment Gateway Distribution</h4>
//                 {report?.subscriptions?.byGateway?.length > 0 ? (
//                   <div className="h-48">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={report.subscriptions.byGateway.map((g) => ({ ...g, name: g.gateway, value: parseInt(g.count), total: report.subscriptions.byGateway.reduce((a, b) => a + parseInt(b.count), 0) }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
//                           {report.subscriptions.byGateway.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} /><Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : (<div className="h-48 flex items-center justify-center text-gray-400">No gateway data</div>)}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* PLATFORM OVERVIEW CARDS */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//         <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg"><Users className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.total_users)}</p><p className="text-sm text-blue-100">Total Users</p></div>
//         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg"><FileText className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.total_elections)}</p><p className="text-sm text-green-100">Total Elections</p></div>
//         <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg"><Vote className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.total_votes)}</p><p className="text-sm text-purple-100">Total Votes</p></div>
//         <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-5 text-white shadow-lg"><CreditCard className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.active_subscriptions)}</p><p className="text-sm text-yellow-100">Active Subs</p></div>
//         <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-5 text-white shadow-lg"><Trophy className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatNumber(report?.overview?.lottery_elections)}</p><p className="text-sm text-pink-100">Lottery Elections</p></div>
//         <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 text-white shadow-lg"><DollarSign className="w-8 h-8 mb-2 opacity-80" /><p className="text-3xl font-bold">{formatCurrency(report?.overview?.total_prize_pool)}</p><p className="text-sm text-emerald-100">Prize Pool</p></div>
//       </div>
//       {/* USER ANALYTICS - WORLD DOMINATION */}
//       <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//         <button onClick={() => toggleSection('users')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//           <div className="flex items-center gap-3"><Globe className="w-6 h-6" /><span className="font-bold text-lg">User Analytics - Global Reach</span></div>
//           {expandedSections.users ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
//         {expandedSections.users && report?.users && (
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border"><p className="text-4xl font-bold text-gray-900">{formatNumber(report.users.stats?.total_registered)}</p><p className="text-sm text-gray-600 mt-1">Total Registered</p></div>
//               <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200"><p className="text-4xl font-bold text-blue-700">{formatNumber(report.users.stats?.new_users_period)}</p><p className="text-sm text-blue-600 mt-1">New ({period}d)</p></div>
//               <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center border border-green-200"><p className="text-4xl font-bold text-green-700">{formatNumber(report.users.stats?.new_users_week)}</p><p className="text-sm text-green-600 mt-1">This Week</p></div>
//               <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center border border-purple-200"><p className="text-4xl font-bold text-purple-700">{formatNumber(report.users.stats?.new_users_today)}</p><p className="text-sm text-purple-600 mt-1">Today</p></div>
//             </div>
//             <div className="grid lg:grid-cols-3 gap-6">
//               {/* Country Distribution */}
//               <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
//                 <h4 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" />Global Distribution</h4>
//                 <div className="space-y-3">
//                   {countryPieData.length > 0 ? countryPieData.map((country, idx) => {
//                     const total = countryPieData.reduce((a, b) => a + b.value, 0);
//                     const percentage = ((country.value / total) * 100).toFixed(1);
//                     return (
//                       <div key={idx} className="flex items-center gap-3">
//                         <span className="text-2xl">{country.flag}</span>
//                         <div className="flex-1">
//                           <div className="flex justify-between text-sm mb-1"><span>{country.name}</span><span className="text-blue-400">{country.value} ({percentage}%)</span></div>
//                           <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${percentage}%` }} /></div>
//                         </div>
//                       </div>
//                     );
//                   }) : <p className="text-slate-400 text-center py-4">No country data</p>}
//                 </div>
//               </div>
//               {/* Gender Distribution */}
//               <div className="bg-white rounded-xl p-5 border">
//                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-pink-600" />Gender Distribution</h4>
//                 {genderPieData.length > 0 ? (
//                   <div className="h-52">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={genderPieData.map(g => ({ ...g, total: genderPieData.reduce((a, b) => a + b.value, 0) }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
//                           {genderPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} /><Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : <div className="h-52 flex items-center justify-center text-gray-400">No gender data</div>}
//               </div>
//               {/* Age Distribution */}
//               <div className="bg-white rounded-xl p-5 border">
//                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" />Age Distribution</h4>
//                 {agePieData.length > 0 ? (
//                   <div className="h-52">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={agePieData.map(a => ({ ...a, total: agePieData.reduce((x, y) => x + y.value, 0) }))} cx="50%" cy="50%" outerRadius={80} dataKey="value">
//                           {agePieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} /><Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : <div className="h-52 flex items-center justify-center text-gray-400">No age data</div>}
//               </div>
//             </div>
//             {/* Registration Trend */}
//             {report.users.trend?.length > 0 && (
//               <div className="bg-white rounded-xl p-5 border">
//                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600" />Registration Trend</h4>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={report.users.trend.map(t => ({ ...t, count: parseInt(t.count) }))}>
//                       <defs><linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                       <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
//                       <YAxis tick={{ fontSize: 12 }} />
//                       <Tooltip labelFormatter={formatDate} />
//                       <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorUsers)" strokeWidth={2} />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ELECTIONS ANALYTICS */}
//       <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//         <button onClick={() => toggleSection('elections')} className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white">
//           <div className="flex items-center gap-3"><FileText className="w-6 h-6" /><span className="font-bold text-lg">Election Analytics</span></div>
//           {expandedSections.elections ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
//         {expandedSections.elections && report?.elections && (
//           <div className="p-6 space-y-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Election Status Pie */}
//               <div className="bg-gray-50 rounded-xl p-5">
//                 <h4 className="font-semibold text-gray-800 mb-4">Election Status</h4>
//                 {electionStatusData.length > 0 ? (
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={electionStatusData.map(e => ({ ...e, total: electionStatusData.reduce((a, b) => a + b.value, 0) }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
//                           {electionStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} /><Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : <div className="h-64 flex items-center justify-center text-gray-400">No election data</div>}
//               </div>
//               {/* Voting Type Pie */}
//               <div className="bg-gray-50 rounded-xl p-5">
//                 <h4 className="font-semibold text-gray-800 mb-4">Voting Methods</h4>
//                 {votingTypeData.length > 0 ? (
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={votingTypeData.map(v => ({ ...v, total: votingTypeData.reduce((a, b) => a + b.value, 0) }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
//                           {votingTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} /><Legend />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 ) : <div className="h-64 flex items-center justify-center text-gray-400">No voting type data</div>}
//               </div>
//             </div>
//             {/* Features Usage */}
//             <div>
//               <h4 className="font-semibold text-gray-800 mb-4">Feature Usage</h4>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//                 <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100"><Trophy className="w-6 h-6 text-pink-600 mx-auto mb-2" /><p className="text-2xl font-bold text-pink-800">{report.elections.stats?.lottery_enabled_count || 0}</p><p className="text-xs text-pink-600">Lottery</p></div>
//                 <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100"><Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-800">{report.elections.stats?.biometric_required_count || 0}</p><p className="text-xs text-blue-600">Biometric</p></div>
//                 <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100"><UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-800">{report.elections.stats?.anonymous_voting_count || 0}</p><p className="text-xs text-purple-600">Anonymous</p></div>
//                 <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100"><Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" /><p className="text-2xl font-bold text-orange-800">{report.elections.stats?.video_required_count || 0}</p><p className="text-xs text-orange-600">Video Req.</p></div>
//                 <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100"><BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold text-green-800">{report.elections.stats?.live_results_count || 0}</p><p className="text-xs text-green-600">Live Results</p></div>
//                 <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-100"><Settings className="w-6 h-6 text-cyan-600 mx-auto mb-2" /><p className="text-2xl font-bold text-cyan-800">{report.elections.stats?.vote_editing_count || 0}</p><p className="text-xs text-cyan-600">Edit Votes</p></div>
//               </div>
//             </div>
//             {/* Top Elections Table */}
//             {report.elections.topElections?.length > 0 && (
//               <div className="bg-gray-50 rounded-xl p-5">
//                 <h4 className="font-semibold text-gray-800 mb-4">Top Elections</h4>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead><tr className="border-b"><th className="px-3 py-3 text-left font-medium text-gray-600">Title</th><th className="px-3 py-3 text-center font-medium text-gray-600">Status</th><th className="px-3 py-3 text-right font-medium text-gray-600">Votes</th><th className="px-3 py-3 text-right font-medium text-gray-600">Views</th><th className="px-3 py-3 text-center font-medium text-gray-600">Features</th></tr></thead>
//                     <tbody className="divide-y">
//                       {report.elections.topElections.map((election) => (
//                         <tr key={election.id} className="hover:bg-white transition">
//                           <td className="px-3 py-3 font-medium truncate max-w-[250px]">{election.title}</td>
//                           <td className="px-3 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${election.status === 'active' ? 'bg-green-100 text-green-700' : election.status === 'published' ? 'bg-blue-100 text-blue-700' : election.status === 'completed' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{election.status}</span></td>
//                           <td className="px-3 py-3 text-right font-bold text-purple-600">{election.vote_count || 0}</td>
//                           <td className="px-3 py-3 text-right text-gray-600">{election.view_count || 0}</td>
//                           <td className="px-3 py-3 text-center"><div className="flex justify-center gap-1">{election.lottery_enabled && <Trophy className="w-4 h-4 text-pink-500" />}{election.is_free ? <span className="text-xs bg-green-100 text-green-600 px-1 rounded">Free</span> : <span className="text-xs bg-yellow-100 text-yellow-600 px-1 rounded">Paid</span>}</div></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* VOTE & LOTTERY ANALYTICS */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* Vote Analytics */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white"><div className="flex items-center gap-3"><Vote className="w-6 h-6" /><span className="font-bold text-lg">Vote Analytics</span></div></div>
//           <div className="p-6 space-y-4">
//             <div className="grid grid-cols-3 gap-3">
//               <div className="bg-purple-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-purple-900">{formatNumber(report?.votes?.stats?.total_votes)}</p><p className="text-xs text-purple-600">Total</p></div>
//               <div className="bg-green-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-green-900">{formatNumber(report?.votes?.stats?.valid_votes)}</p><p className="text-xs text-green-600">Valid</p></div>
//               <div className="bg-blue-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-blue-900">{formatNumber(report?.votes?.stats?.unique_voters)}</p><p className="text-xs text-blue-600">Unique Voters</p></div>
//             </div>
//             <div className="grid grid-cols-3 gap-3">
//               <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold">{formatNumber(report?.votes?.stats?.votes_period)}</p><p className="text-xs text-gray-500">Last {period}d</p></div>
//               <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold">{formatNumber(report?.votes?.stats?.votes_week)}</p><p className="text-xs text-gray-500">This Week</p></div>
//               <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold">{formatNumber(report?.votes?.stats?.votes_today)}</p><p className="text-xs text-gray-500">Today</p></div>
//             </div>
//           </div>
//         </div>
//         {/* Lottery Analytics */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white"><div className="flex items-center gap-3"><Trophy className="w-6 h-6" /><span className="font-bold text-lg">Lottery Analytics</span></div></div>
//           <div className="p-6 space-y-4">
//             <div className="grid grid-cols-3 gap-3">
//               <div className="bg-pink-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-pink-900">{formatNumber(report?.lottery?.stats?.total_draws)}</p><p className="text-xs text-pink-600">Total Draws</p></div>
//               <div className="bg-green-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-green-900">{formatNumber(report?.lottery?.stats?.completed_draws)}</p><p className="text-xs text-green-600">Completed</p></div>
//               <div className="bg-purple-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-purple-900">{formatNumber(report?.lottery?.stats?.total_winner_slots)}</p><p className="text-xs text-purple-600">Winners</p></div>
//             </div>
//             {report?.lottery?.byRewardType?.length > 0 && (
//               <div className="space-y-2">
//                 {report.lottery.byRewardType.map((item, idx) => (
//                   <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 rounded-lg">
//                     <span className="text-sm font-medium capitalize">{item.lottery_reward_type?.replace('_', ' ')}</span>
//                     <div className="text-right"><span className="font-bold text-purple-700">{item.count} elections</span><span className="text-xs text-gray-500 ml-2">({formatCurrency(item.total_prize_pool)})</span></div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* RECENT ACTIVITY */}
//       {realtime?.recentVotes?.length > 0 && (
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white"><div className="flex items-center gap-3"><Activity className="w-6 h-6" /><span className="font-bold text-lg">Recent Activity</span></div></div>
//           <div className="p-6">
//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {realtime.recentVotes.map((vote, idx) => (
//                 <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
//                   <div className={`w-3 h-3 rounded-full ${vote.anonymous ? 'bg-purple-500' : 'bg-green-500'}`} />
//                   <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{vote.election_title}</p><p className="text-xs text-gray-500">{new Date(vote.created_at).toLocaleString()}</p></div>
//                   {vote.anonymous && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Anon</span>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // src/pages/admin/LiveAnalytics.jsx
// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import {
//   BarChart3, Users, Vote, Trophy, CreditCard, TrendingUp,
//   RefreshCw, Calendar, Globe, PieChart, Activity, Eye,
//   CheckCircle, XCircle, Clock, Zap, Award, DollarSign,
//   UserCheck, FileText, Settings, ChevronDown, ChevronUp
// } from 'lucide-react';

// // RTK Query hooks
// import {
//   useGetPlatformReportQuery,
//   useGetRealTimeStatsQuery,
// } from '../../redux/api/analytics/platformAnalyticsApi';

// export default function LiveAnalytics() {
//     /*eslint-disable*/
//   const { t } = useTranslation();
//   const [period, setPeriod] = useState(30);
//   const [expandedSections, setExpandedSections] = useState({
//     overview: true,
//     users: true,
//     elections: true,
//     votes: true,
//     lottery: true,
//     subscriptions: true
//   });

//   // Fetch analytics data
//   const { 
//     data: reportData, 
//     isLoading: reportLoading, 
//     refetch: refetchReport,
//     error: reportError 
//   } = useGetPlatformReportQuery({ period });

//   const { 
//     data: realtimeData, 
//     isLoading: realtimeLoading, 
//     refetch: refetchRealtime 
//   } = useGetRealTimeStatsQuery();

//   const report = reportData?.data;
//   const realtime = realtimeData?.data;

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const handleRefresh = () => {
//     refetchReport();
//     refetchRealtime();
//   };

//   // Format numbers
//   const formatNumber = (num) => {
//     if (!num) return '0';
//     const n = parseFloat(num);
//     if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
//     if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
//     return n.toLocaleString();
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     if (!amount) return '$0';
//     return '$' + parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   // Format date
//   const formatDate = (date) => {
//     if (!date) return '-';
//     return new Date(date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   if (reportLoading && !report) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   if (reportError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center bg-red-50 p-8 rounded-lg">
//           <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 font-medium">Failed to load analytics</p>
//           <p className="text-red-500 text-sm mt-2">{reportError?.data?.message || 'Unknown error'}</p>
//           <button 
//             onClick={handleRefresh}
//             className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Activity className="w-7 h-7 text-purple-600" />
//             Live Platform Analytics
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Real-time insights and comprehensive platform statistics
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           {/* Period Selector */}
//           <select
//             value={period}
//             onChange={(e) => setPeriod(parseInt(e.target.value))}
//             className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
//           >
//             <option value={7}>Last 7 days</option>
//             <option value={30}>Last 30 days</option>
//             <option value={90}>Last 90 days</option>
//             <option value={365}>Last year</option>
//           </select>
//           {/* Refresh Button */}
//           <button
//             onClick={handleRefresh}
//             disabled={reportLoading}
//             className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
//           >
//             <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Last Updated */}
//       {report?.generatedAt && (
//         <div className="text-sm text-gray-500 flex items-center gap-2">
//           <Clock className="w-4 h-4" />
//           Last updated: {new Date(report.generatedAt).toLocaleString()}
//         </div>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* REAL-TIME STATS BAR */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {realtime && (
//         <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
//           <div className="flex items-center gap-2 mb-3">
//             <Zap className="w-5 h-5" />
//             <span className="font-semibold">Real-Time Activity</span>
//           </div>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
//             <div className="text-center">
//               <p className="text-3xl font-bold">{realtime.stats?.active_elections || 0}</p>
//               <p className="text-xs opacity-80">Active Elections</p>
//             </div>
//             <div className="text-center">
//               <p className="text-3xl font-bold">{realtime.stats?.published_elections || 0}</p>
//               <p className="text-xs opacity-80">Published</p>
//             </div>
//             <div className="text-center">
//               <p className="text-3xl font-bold">{realtime.stats?.votes_last_hour || 0}</p>
//               <p className="text-xs opacity-80">Votes (1h)</p>
//             </div>
//             <div className="text-center">
//               <p className="text-3xl font-bold">{realtime.stats?.votes_last_24h || 0}</p>
//               <p className="text-xs opacity-80">Votes (24h)</p>
//             </div>
//             <div className="text-center">
//               <p className="text-3xl font-bold">{realtime.stats?.new_users_24h || 0}</p>
//               <p className="text-xs opacity-80">New Users (24h)</p>
//             </div>
//             <div className="text-center">
//               <p className="text-3xl font-bold">{realtime.stats?.pending_lottery_draws || 0}</p>
//               <p className="text-xs opacity-80">Pending Draws</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* OVERVIEW SECTION */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <button
//           onClick={() => toggleSection('overview')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
//         >
//           <div className="flex items-center gap-3">
//             <BarChart3 className="w-5 h-5 text-purple-600" />
//             <span className="font-semibold text-gray-900">Platform Overview</span>
//           </div>
//           {expandedSections.overview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
        
//         {expandedSections.overview && report?.overview && (
//           <div className="p-6">
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//               <div className="bg-blue-50 rounded-lg p-4">
//                 <Users className="w-8 h-8 text-blue-600 mb-2" />
//                 <p className="text-2xl font-bold text-blue-900">{formatNumber(report.overview.total_users)}</p>
//                 <p className="text-sm text-blue-600">Total Users</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4">
//                 <FileText className="w-8 h-8 text-green-600 mb-2" />
//                 <p className="text-2xl font-bold text-green-900">{formatNumber(report.overview.total_elections)}</p>
//                 <p className="text-sm text-green-600">Total Elections</p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-4">
//                 <Vote className="w-8 h-8 text-purple-600 mb-2" />
//                 <p className="text-2xl font-bold text-purple-900">{formatNumber(report.overview.total_votes)}</p>
//                 <p className="text-sm text-purple-600">Total Votes</p>
//               </div>
//               <div className="bg-yellow-50 rounded-lg p-4">
//                 <CreditCard className="w-8 h-8 text-yellow-600 mb-2" />
//                 <p className="text-2xl font-bold text-yellow-900">{formatNumber(report.overview.active_subscriptions)}</p>
//                 <p className="text-sm text-yellow-600">Active Subs</p>
//               </div>
//               <div className="bg-pink-50 rounded-lg p-4">
//                 <Trophy className="w-8 h-8 text-pink-600 mb-2" />
//                 <p className="text-2xl font-bold text-pink-900">{formatNumber(report.overview.lottery_elections)}</p>
//                 <p className="text-sm text-pink-600">Lottery Elections</p>
//               </div>
//               <div className="bg-emerald-50 rounded-lg p-4">
//                 <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
//                 <p className="text-2xl font-bold text-emerald-900">{formatCurrency(report.overview.total_prize_pool)}</p>
//                 <p className="text-sm text-emerald-600">Prize Pool</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* USERS SECTION */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <button
//           onClick={() => toggleSection('users')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
//         >
//           <div className="flex items-center gap-3">
//             <Users className="w-5 h-5 text-blue-600" />
//             <span className="font-semibold text-gray-900">User Analytics</span>
//           </div>
//           {expandedSections.users ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
        
//         {expandedSections.users && report?.users && (
//           <div className="p-6 space-y-6">
//             {/* User Stats */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-gray-900">{formatNumber(report.users.stats?.total_registered)}</p>
//                 <p className="text-sm text-gray-600">Total Registered</p>
//               </div>
//               <div className="bg-blue-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-blue-900">{formatNumber(report.users.stats?.new_users_period)}</p>
//                 <p className="text-sm text-blue-600">New ({period}d)</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-green-900">{formatNumber(report.users.stats?.new_users_week)}</p>
//                 <p className="text-sm text-green-600">This Week</p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-purple-900">{formatNumber(report.users.stats?.new_users_today)}</p>
//                 <p className="text-sm text-purple-600">Today</p>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-3 gap-6">
//               {/* By Country */}
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                   <Globe className="w-4 h-4" /> By Country
//                 </h4>
//                 <div className="space-y-2">
//                   {report.users.byCountry?.length > 0 ? (
//                     report.users.byCountry.map((item, idx) => (
//                       <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                         <span className="text-sm">{item.country || 'Unknown'}</span>
//                         <span className="font-semibold text-blue-600">{item.count}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-400 text-sm">No data</p>
//                   )}
//                 </div>
//               </div>

//               {/* By Gender */}
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                   <UserCheck className="w-4 h-4" /> By Gender
//                 </h4>
//                 <div className="space-y-2">
//                   {report.users.byGender?.length > 0 ? (
//                     report.users.byGender.map((item, idx) => (
//                       <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                         <span className="text-sm capitalize">{item.gender}</span>
//                         <span className="font-semibold text-green-600">{item.count}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-400 text-sm">No data</p>
//                   )}
//                 </div>
//               </div>

//               {/* By Age */}
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                   <Calendar className="w-4 h-4" /> By Age Group
//                 </h4>
//                 <div className="space-y-2">
//                   {report.users.byAge?.length > 0 ? (
//                     report.users.byAge.map((item, idx) => (
//                       <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                         <span className="text-sm">{item.age_group}</span>
//                         <span className="font-semibold text-purple-600">{item.count}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-400 text-sm">No data</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* User Trend */}
//             {report.users.trend?.length > 0 && (
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                   <TrendingUp className="w-4 h-4" /> Registration Trend
//                 </h4>
//                 <div className="flex items-end gap-1 h-32 bg-gray-50 rounded-lg p-4">
//                   {report.users.trend.map((item, idx) => {
//                     const maxCount = Math.max(...report.users.trend.map(t => parseInt(t.count)));
//                     const height = maxCount > 0 ? (parseInt(item.count) / maxCount) * 100 : 0;
//                     return (
//                       <div key={idx} className="flex-1 flex flex-col items-center justify-end">
//                         <div 
//                           className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
//                           style={{ height: `${Math.max(height, 5)}%` }}
//                           title={`${formatDate(item.date)}: ${item.count}`}
//                         />
//                         {idx % Math.ceil(report.users.trend.length / 7) === 0 && (
//                           <span className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ELECTIONS SECTION */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <button
//           onClick={() => toggleSection('elections')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
//         >
//           <div className="flex items-center gap-3">
//             <FileText className="w-5 h-5 text-green-600" />
//             <span className="font-semibold text-gray-900">Election Analytics</span>
//           </div>
//           {expandedSections.elections ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
        
//         {expandedSections.elections && report?.elections && (
//           <div className="p-6 space-y-6">
//             {/* Status Breakdown */}
//             <div>
//               <h4 className="font-medium text-gray-700 mb-3">Status Breakdown</h4>
//               <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
//                 <div className="bg-gray-100 rounded-lg p-3 text-center">
//                   <p className="text-xl font-bold">{report.elections.stats?.draft || 0}</p>
//                   <p className="text-xs text-gray-600">Draft</p>
//                 </div>
//                 <div className="bg-blue-100 rounded-lg p-3 text-center">
//                   <p className="text-xl font-bold text-blue-800">{report.elections.stats?.published || 0}</p>
//                   <p className="text-xs text-blue-600">Published</p>
//                 </div>
//                 <div className="bg-green-100 rounded-lg p-3 text-center">
//                   <p className="text-xl font-bold text-green-800">{report.elections.stats?.active || 0}</p>
//                   <p className="text-xs text-green-600">Active</p>
//                 </div>
//                 <div className="bg-purple-100 rounded-lg p-3 text-center">
//                   <p className="text-xl font-bold text-purple-800">{report.elections.stats?.completed || 0}</p>
//                   <p className="text-xs text-purple-600">Completed</p>
//                 </div>
//                 <div className="bg-red-100 rounded-lg p-3 text-center">
//                   <p className="text-xl font-bold text-red-800">{report.elections.stats?.cancelled || 0}</p>
//                   <p className="text-xs text-red-600">Cancelled</p>
//                 </div>
//               </div>
//             </div>

//             {/* Voting Type & Pricing */}
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">By Voting Type</h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                     <span className="text-sm">Plurality</span>
//                     <span className="font-semibold">{report.elections.stats?.plurality || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                     <span className="text-sm">Ranked Choice</span>
//                     <span className="font-semibold">{report.elections.stats?.ranked_choice || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                     <span className="text-sm">Approval</span>
//                     <span className="font-semibold">{report.elections.stats?.approval || 0}</span>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">By Pricing</h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded">
//                     <span className="text-sm text-green-700">Free Elections</span>
//                     <span className="font-semibold text-green-700">{report.elections.stats?.free_elections || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center bg-yellow-50 px-3 py-2 rounded">
//                     <span className="text-sm text-yellow-700">Paid Elections</span>
//                     <span className="font-semibold text-yellow-700">{report.elections.stats?.paid_elections || 0}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Features Usage */}
//             <div>
//               <h4 className="font-medium text-gray-700 mb-3">Feature Usage</h4>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
//                 <div className="bg-pink-50 rounded-lg p-3 text-center">
//                   <Trophy className="w-5 h-5 text-pink-600 mx-auto mb-1" />
//                   <p className="text-lg font-bold text-pink-800">{report.elections.stats?.lottery_enabled_count || 0}</p>
//                   <p className="text-xs text-pink-600">Lottery</p>
//                 </div>
//                 <div className="bg-blue-50 rounded-lg p-3 text-center">
//                   <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
//                   <p className="text-lg font-bold text-blue-800">{report.elections.stats?.biometric_required_count || 0}</p>
//                   <p className="text-xs text-blue-600">Biometric</p>
//                 </div>
//                 <div className="bg-purple-50 rounded-lg p-3 text-center">
//                   <UserCheck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
//                   <p className="text-lg font-bold text-purple-800">{report.elections.stats?.anonymous_voting_count || 0}</p>
//                   <p className="text-xs text-purple-600">Anonymous</p>
//                 </div>
//                 <div className="bg-orange-50 rounded-lg p-3 text-center">
//                   <Activity className="w-5 h-5 text-orange-600 mx-auto mb-1" />
//                   <p className="text-lg font-bold text-orange-800">{report.elections.stats?.video_required_count || 0}</p>
//                   <p className="text-xs text-orange-600">Video Req.</p>
//                 </div>
//                 <div className="bg-green-50 rounded-lg p-3 text-center">
//                   <BarChart3 className="w-5 h-5 text-green-600 mx-auto mb-1" />
//                   <p className="text-lg font-bold text-green-800">{report.elections.stats?.live_results_count || 0}</p>
//                   <p className="text-xs text-green-600">Live Results</p>
//                 </div>
//                 <div className="bg-cyan-50 rounded-lg p-3 text-center">
//                   <Settings className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
//                   <p className="text-lg font-bold text-cyan-800">{report.elections.stats?.vote_editing_count || 0}</p>
//                   <p className="text-xs text-cyan-600">Edit Votes</p>
//                 </div>
//               </div>
//             </div>

//             {/* Top Elections */}
//             {report.elections.topElections?.length > 0 && (
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">Top Elections</h4>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Title</th>
//                         <th className="px-3 py-2 text-center">Status</th>
//                         <th className="px-3 py-2 text-right">Votes</th>
//                         <th className="px-3 py-2 text-right">Views</th>
//                         <th className="px-3 py-2 text-center">Lottery</th>
//                         <th className="px-3 py-2 text-center">Free</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y">
//                       {report.elections.topElections.map((election) => (
//                         <tr key={election.id} className="hover:bg-gray-50">
//                           <td className="px-3 py-2 font-medium truncate max-w-[200px]">{election.title}</td>
//                           <td className="px-3 py-2 text-center">
//                             <span className={`px-2 py-1 rounded text-xs ${
//                               election.status === 'active' ? 'bg-green-100 text-green-700' :
//                               election.status === 'published' ? 'bg-blue-100 text-blue-700' :
//                               election.status === 'completed' ? 'bg-purple-100 text-purple-700' :
//                               'bg-gray-100 text-gray-700'
//                             }`}>
//                               {election.status}
//                             </span>
//                           </td>
//                           <td className="px-3 py-2 text-right font-semibold">{election.vote_count || 0}</td>
//                           <td className="px-3 py-2 text-right">{election.view_count || 0}</td>
//                           <td className="px-3 py-2 text-center">
//                             {election.lottery_enabled ? 
//                               <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : 
//                               <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
//                             }
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {election.is_free ? 
//                               <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : 
//                               <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
//                             }
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* VOTES SECTION */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <button
//           onClick={() => toggleSection('votes')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
//         >
//           <div className="flex items-center gap-3">
//             <Vote className="w-5 h-5 text-purple-600" />
//             <span className="font-semibold text-gray-900">Vote Analytics</span>
//           </div>
//           {expandedSections.votes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
        
//         {expandedSections.votes && report?.votes && (
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
//               <div className="bg-purple-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-purple-900">{formatNumber(report.votes.stats?.total_votes)}</p>
//                 <p className="text-sm text-purple-600">Total Votes</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-green-900">{formatNumber(report.votes.stats?.valid_votes)}</p>
//                 <p className="text-sm text-green-600">Valid</p>
//               </div>
//               <div className="bg-red-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-red-900">{formatNumber(report.votes.stats?.invalid_votes)}</p>
//                 <p className="text-sm text-red-600">Invalid</p>
//               </div>
//               <div className="bg-blue-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-blue-900">{formatNumber(report.votes.stats?.unique_voters)}</p>
//                 <p className="text-sm text-blue-600">Unique Voters</p>
//               </div>
//               <div className="bg-yellow-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-yellow-900">{formatNumber(report.votes.stats?.anonymous_votes)}</p>
//                 <p className="text-sm text-yellow-600">Anonymous</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-4">
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <p className="text-2xl font-bold">{formatNumber(report.votes.stats?.votes_period)}</p>
//                 <p className="text-sm text-gray-600">Last {period} days</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <p className="text-2xl font-bold">{formatNumber(report.votes.stats?.votes_week)}</p>
//                 <p className="text-sm text-gray-600">This Week</p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4 text-center">
//                 <p className="text-2xl font-bold">{formatNumber(report.votes.stats?.votes_today)}</p>
//                 <p className="text-sm text-gray-600">Today</p>
//               </div>
//             </div>

//             {/* Vote Trend */}
//             {report.votes.trend?.length > 0 && (
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                   <TrendingUp className="w-4 h-4" /> Voting Trend
//                 </h4>
//                 <div className="flex items-end gap-1 h-32 bg-gray-50 rounded-lg p-4">
//                   {report.votes.trend.map((item, idx) => {
//                     const maxCount = Math.max(...report.votes.trend.map(t => parseInt(t.count)));
//                     const height = maxCount > 0 ? (parseInt(item.count) / maxCount) * 100 : 0;
//                     return (
//                       <div key={idx} className="flex-1 flex flex-col items-center justify-end">
//                         <div 
//                           className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
//                           style={{ height: `${Math.max(height, 5)}%` }}
//                           title={`${formatDate(item.date)}: ${item.count}`}
//                         />
//                         {idx % Math.ceil(report.votes.trend.length / 7) === 0 && (
//                           <span className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* LOTTERY SECTION */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <button
//           onClick={() => toggleSection('lottery')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
//         >
//           <div className="flex items-center gap-3">
//             <Trophy className="w-5 h-5 text-pink-600" />
//             <span className="font-semibold text-gray-900">Lottery Analytics</span>
//           </div>
//           {expandedSections.lottery ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
        
//         {expandedSections.lottery && report?.lottery && (
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
//               <div className="bg-pink-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-pink-900">{formatNumber(report.lottery.stats?.total_draws)}</p>
//                 <p className="text-sm text-pink-600">Total Draws</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-green-900">{formatNumber(report.lottery.stats?.completed_draws)}</p>
//                 <p className="text-sm text-green-600">Completed</p>
//               </div>
//               <div className="bg-yellow-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-yellow-900">{formatNumber(report.lottery.stats?.pending_draws)}</p>
//                 <p className="text-sm text-yellow-600">Pending</p>
//               </div>
//               <div className="bg-blue-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-blue-900">{formatNumber(report.lottery.stats?.total_participants)}</p>
//                 <p className="text-sm text-blue-600">Participants</p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-purple-900">{formatNumber(report.lottery.stats?.total_winner_slots)}</p>
//                 <p className="text-sm text-purple-600">Winner Slots</p>
//               </div>
//             </div>

//             {/* By Reward Type */}
//             {report.lottery.byRewardType?.length > 0 && (
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">By Reward Type</h4>
//                 <div className="grid sm:grid-cols-3 gap-4">
//                   {report.lottery.byRewardType.map((item, idx) => (
//                     <div key={idx} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4">
//                       <p className="text-sm text-gray-600 capitalize">{item.lottery_reward_type?.replace('_', ' ') || 'Unknown'}</p>
//                       <p className="text-2xl font-bold text-purple-900">{item.count} elections</p>
//                       <p className="text-sm text-pink-600">{formatCurrency(item.total_prize_pool)} prize pool</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* SUBSCRIPTIONS SECTION */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//         <button
//           onClick={() => toggleSection('subscriptions')}
//           className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
//         >
//           <div className="flex items-center gap-3">
//             <CreditCard className="w-5 h-5 text-yellow-600" />
//             <span className="font-semibold text-gray-900">Subscription Analytics</span>
//           </div>
//           {expandedSections.subscriptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//         </button>
        
//         {expandedSections.subscriptions && report?.subscriptions && (
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               <div className="bg-yellow-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-yellow-900">{formatNumber(report.subscriptions.stats?.total_subscriptions)}</p>
//                 <p className="text-sm text-yellow-600">Total</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-green-900">{formatNumber(report.subscriptions.stats?.active)}</p>
//                 <p className="text-sm text-green-600">Active</p>
//               </div>
//               <div className="bg-red-50 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-red-900">{formatNumber(report.subscriptions.stats?.cancelled)}</p>
//                 <p className="text-sm text-red-600">Cancelled</p>
//               </div>
//               <div className="bg-gray-100 rounded-lg p-4 text-center">
//                 <p className="text-3xl font-bold text-gray-900">{formatNumber(report.subscriptions.stats?.expired)}</p>
//                 <p className="text-sm text-gray-600">Expired</p>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Payment Type */}
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">By Payment Type</h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded">
//                     <span className="text-sm">Recurring</span>
//                     <span className="font-semibold text-blue-700">{report.subscriptions.stats?.recurring_count || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded">
//                     <span className="text-sm">Pay-as-you-go</span>
//                     <span className="font-semibold text-purple-700">{report.subscriptions.stats?.pay_as_you_go_count || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded">
//                     <span className="text-sm">Auto-renew Enabled</span>
//                     <span className="font-semibold text-green-700">{report.subscriptions.stats?.auto_renew_enabled || 0}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* By Gateway */}
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">By Gateway</h4>
//                 <div className="space-y-2">
//                   {report.subscriptions.byGateway?.length > 0 ? (
//                     report.subscriptions.byGateway.map((item, idx) => (
//                       <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
//                         <span className="text-sm capitalize">{item.gateway}</span>
//                         <span className="font-semibold">{item.count}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-400 text-sm">No data</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* By Plan */}
//             {report.subscriptions.byPlan?.length > 0 && (
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-3">By Plan</h4>
//                 <div className="grid sm:grid-cols-3 gap-4">
//                   {report.subscriptions.byPlan.map((item, idx) => (
//                     <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 text-center">
//                       <p className="text-sm text-gray-600">Plan #{item.plan_id}</p>
//                       <p className="text-2xl font-bold text-yellow-900">{item.count} users</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* RECENT ACTIVITY (from real-time) */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {realtime?.recentVotes?.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//           <div className="px-6 py-4 bg-gray-50 border-b">
//             <div className="flex items-center gap-3">
//               <Activity className="w-5 h-5 text-indigo-600" />
//               <span className="font-semibold text-gray-900">Recent Votes</span>
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="space-y-3">
//               {realtime.recentVotes.map((vote, idx) => (
//                 <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
//                   <div className="flex items-center gap-3">
//                     <div className={`w-2 h-2 rounded-full ${vote.anonymous ? 'bg-purple-500' : 'bg-green-500'}`} />
//                     <div>
//                       <p className="font-medium text-sm">{vote.election_title}</p>
//                       <p className="text-xs text-gray-500">Election #{vote.election_id}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-gray-500">
//                       {new Date(vote.created_at).toLocaleString()}
//                     </p>
//                     {vote.anonymous && (
//                       <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Anonymous</span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }