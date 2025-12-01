// src/pages/admin/RevenueAnalyticsPage.jsx
// Comprehensive Platform Revenue Analytics with Subscriptions & Platform Fees
import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, Users, Wallet, RefreshCw,
  ChevronDown, ChevronUp, Globe, Trophy, Activity, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
  Percent, PieChart as PieChartIcon, BarChart3, FileText,
  Zap, Target, TrendingDown, Banknote, Receipt, Building2,
  CalendarDays, Filter, Download, Eye, HelpCircle, Info
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
  LineChart, Line, ComposedChart
} from 'recharts';

// RTK Query hook
import { useGetPlatformRevenueReportQuery } from '../../redux/api/analytics/platformAnalyticsApi';

// Colors
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
const GATEWAY_COLORS = {
  'stripe': '#635bff',
  'paddle': '#3b82f6',
  'paypal': '#003087',
  'unknown': '#9ca3af'
};

// Tooltip Component with proper multi-line support and visible icon
const InfoTooltip = ({ text, light = false }) => {
  return (
    <div className="group relative inline-flex items-center ml-1.5 cursor-help">
      <div className={`p-0.5 rounded-full transition-colors ${light ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}>
        <HelpCircle className={`w-4 h-4 ${light ? 'text-white/70 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-72 shadow-xl pointer-events-none">
        <div className="leading-relaxed">{text}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default function RevenueAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    platformFees: true,
    subscriptions: true,
    trends: true,
    topElections: true,
    recentPayments: true,
    gateways: true
  });

  const { 
    data: revenueData, 
    isLoading, 
    error, 
    refetch 
  } = useGetPlatformRevenueReportQuery({ period });

  const revenue = revenueData?.data;
  const summary = revenue?.summary;
  const subscriptions = revenue?.subscriptions;
  const platformFees = revenue?.platformFees;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return '$' + parseFloat(amount).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    const n = parseFloat(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700',
      'success': 'bg-green-100 text-green-700',
      'succeeded': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'failed': 'bg-red-100 text-red-700',
      'refunded': 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getGatewayIcon = (gateway) => {
    const icons = {
      'stripe': '💳',
      'paddle': '🏓',
      'paypal': '🅿️'
    };
    return icons[gateway?.toLowerCase()] || '💰';
  };

  // Prepare chart data
  const revenueDistributionData = [
    { 
      name: 'Platform Fees', 
      value: parseFloat(summary?.total_platform_fee_revenue || 0),
      color: '#10b981'
    },
    { 
      name: 'Subscription Usage', 
      value: parseFloat(summary?.total_subscription_usage_revenue || 0),
      color: '#8b5cf6'
    }
  ].filter(item => item.value > 0);

  const feeBreakdownData = [
    { 
      name: 'Platform Revenue', 
      value: parseFloat(summary?.total_platform_fee_revenue || 0),
      color: '#10b981'
    },
    { 
      name: 'Creator Earnings', 
      value: parseFloat(summary?.total_net_to_creators || 0),
      color: '#3b82f6'
    },
    { 
      name: 'Processing Fees', 
      value: parseFloat(summary?.total_processing_fees || 0),
      color: '#f59e0b'
    }
  ].filter(item => item.value > 0);

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 shadow-xl rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = revenueDistributionData.reduce((a, b) => a + b.value, 0) || 1;
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white px-4 py-3 shadow-xl rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <DollarSign className="w-16 h-16 text-emerald-200 mx-auto" />
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading revenue analytics...</p>
          <p className="text-sm text-gray-400">Crunching the numbers</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Revenue Data</h2>
          <p className="text-gray-600 mb-4">{error?.data?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={refetch}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="w-8 h-8" />
                </div>
                Revenue Analytics
              </h1>
              <p className="text-emerald-100 mt-2">
                Comprehensive platform earnings from subscriptions and election fees
              </p>
              {revenue?.generatedAt && (
                <p className="text-xs text-emerald-200 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last updated: {new Date(revenue.generatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={period} 
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
              >
                <option value={7} className="text-gray-900">Last 7 days</option>
                <option value={30} className="text-gray-900">Last 30 days</option>
                <option value={90} className="text-gray-900">Last 90 days</option>
                <option value={365} className="text-gray-900">Last year</option>
              </select>
              <button 
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-4xl font-bold">{formatCurrency(summary?.total_platform_revenue)}</p>
              <p className="text-sm text-emerald-200 mt-1 flex items-center justify-center">
                Total Platform Revenue
                <InfoTooltip 
                  light={true}
                  text="The combined earnings from subscription payments and platform fees collected from all successful election transactions. This represents your total platform income."
                />
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-300">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
              <p className="text-sm text-emerald-200 mt-1 flex items-center justify-center">
                Platform Fees Earned
                <InfoTooltip 
                  light={true}
                  text="Revenue collected as processing fees from election payments. The fee rate varies based on the user's subscription plan (can be fixed amount or percentage)."
                />
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-300">{formatCurrency(summary?.total_payment_volume)}</p>
              <p className="text-sm text-emerald-200 mt-1 flex items-center justify-center">
                Total Payment Volume
                <InfoTooltip 
                  light={true}
                  text="The gross amount of all successful payments (elections + subscriptions) processed through Stripe and Paddle payment gateways, before any fees are deducted."
                />
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-300">{formatNumber(platformFees?.stats?.successful_payments)}</p>
              <p className="text-sm text-emerald-200 mt-1 flex items-center justify-center">
                Successful Payments
                <InfoTooltip 
                  light={true}
                  text="The total number of election payment transactions that were completed successfully. Includes payments with status: completed, success, or succeeded."
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Platform Revenue */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Wallet className="w-8 h-8" />
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                All Time
              </span>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(summary?.total_platform_revenue)}</p>
            <p className="text-emerald-100 mt-2 text-sm flex items-center">
              Total Platform Revenue
              <InfoTooltip 
                light={true}
                text="Sum of all subscription payments plus platform fees from election transactions since platform launch."
              />
            </p>
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-emerald-200 flex items-center">
                  This Period
                  <InfoTooltip 
                    light={true}
                    text={`Platform fees earned within the selected time period (last ${period} days).`}
                  />
                </p>
                <p className="font-semibold">{formatCurrency(summary?.platform_fee_this_period)}</p>
              </div>
              <div>
                <p className="text-emerald-200 flex items-center">
                  Volume
                  <InfoTooltip 
                    light={true}
                    text="Total gross payment amount processed through all payment gateways."
                  />
                </p>
                <p className="font-semibold">{formatCurrency(summary?.total_payment_volume)}</p>
              </div>
            </div>
          </div>

          {/* Platform Fee Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Percent className="w-8 h-8" />
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {summary?.platform_fee_percentage}%
              </span>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
            <p className="text-green-100 mt-2 text-sm flex items-center">
              Platform Fee Revenue
              <InfoTooltip 
                light={true}
                text="Revenue collected as processing fees from each election payment. Fee rates vary by subscription plan and can be either a fixed amount or percentage."
              />
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between text-sm">
                <span className="text-green-200 flex items-center">
                  From election payments
                  <InfoTooltip 
                    light={true}
                    text="Fees collected when users pay to participate in paid elections or create paid voting events."
                  />
                </span>
                <span className="font-semibold">{formatNumber(platformFees?.stats?.successful_payments)} txns</span>
              </div>
            </div>
          </div>

          {/* Creator Earnings */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                Net Amount
              </span>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(summary?.total_net_to_creators)}</p>
            <p className="text-blue-100 mt-2 text-sm flex items-center">
              Creator Earnings
              <InfoTooltip 
                light={true}
                text="The amount election creators receive after platform fees and payment gateway processing fees (Stripe/Paddle) are deducted from the gross payment."
              />
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200 flex items-center">
                  After all fees
                  <InfoTooltip 
                    light={true}
                    text="Net Amount = Gross Payment - Platform Fee - Gateway Processing Fee"
                  />
                </span>
                <span className="font-semibold">Paid to creators</span>
              </div>
            </div>
          </div>

          {/* Processing Fees */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                Gateway Fees
              </span>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(summary?.total_processing_fees)}</p>
            <p className="text-amber-100 mt-2 text-sm flex items-center">
              Processing Fees
              <InfoTooltip 
                light={true}
                text="Fees charged by payment processors (Stripe and Paddle) for handling transactions. These are NOT platform revenue - they are paid to the payment gateways."
              />
            </p>
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-amber-200 flex items-center">
                  Stripe
                  <InfoTooltip 
                    light={true}
                    text="Processing fees paid to Stripe for card transactions."
                  />
                </p>
                <p className="font-semibold">{formatCurrency(platformFees?.stats?.total_stripe_fees)}</p>
              </div>
              <div>
                <p className="text-amber-200 flex items-center">
                  Paddle
                  <InfoTooltip 
                    light={true}
                    text="Processing fees paid to Paddle (includes tax handling)."
                  />
                </p>
                <p className="font-semibold">{formatCurrency(platformFees?.stats?.total_paddle_fees)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Distribution & Fee Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Distribution Pie */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-600" />
                Revenue Distribution
                <InfoTooltip text="Visual breakdown showing how your total platform revenue is split between different revenue sources. Hover over chart segments for detailed amounts." />
              </h3>
            </div>
            <div className="p-6">
              {revenueDistributionData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenueDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend 
                        formatter={(value) => <span className="text-gray-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No revenue data yet</p>
                  </div>
                </div>
              )}
              
              {/* Legend Details */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      Platform Fees
                      <InfoTooltip text="Revenue from processing fees collected on each election payment transaction." />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{summary?.platform_fee_percentage}% of total</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      Subscription Revenue
                      <InfoTooltip text="Revenue from user subscription plan payments (monthly, quarterly, annual plans)." />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary?.total_subscription_usage_revenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{summary?.subscription_percentage}% of total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Volume Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Payment Volume Breakdown
                <InfoTooltip text="Shows how the total payment volume is distributed between platform revenue, creator earnings, and gateway processing fees." />
              </h3>
            </div>
            <div className="p-6">
              {feeBreakdownData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feeBreakdownData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {feeBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No payment data yet</p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-xs text-green-600 font-medium flex items-center justify-center">
                    Platform
                    <InfoTooltip text="Your platform's earnings from each transaction based on the configured fee rates." />
                  </p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-blue-600 font-medium flex items-center justify-center">
                    To Creators
                    <InfoTooltip text="Amount received by election creators after all fees are deducted." />
                  </p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(summary?.total_net_to_creators)}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-xs text-amber-600 font-medium flex items-center justify-center">
                    Gateway Fees
                    <InfoTooltip text="Combined Stripe & Paddle processing fees (not your revenue)." />
                  </p>
                  <p className="text-lg font-bold text-amber-700">{formatCurrency(summary?.total_processing_fees)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Fee Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
          <button 
            onClick={() => toggleSection('platformFees')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white"
          >
            <div className="flex items-center gap-3">
              <Percent className="w-6 h-6" />
              <span className="font-bold text-lg">Platform Fee Analytics</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Election Payments</span>
            </div>
            {expandedSections.platformFees ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.platformFees && (
            <div className="p-6 space-y-6">
              {/* Platform Fee Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{formatNumber(platformFees?.stats?.successful_payments)}</p>
                  <p className="text-xs text-green-600 flex items-center justify-center">
                    Successful
                    <InfoTooltip text="Payments with status: completed, success, or succeeded." />
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 text-center border border-yellow-100">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">{formatNumber(platformFees?.stats?.pending_payments)}</p>
                  <p className="text-xs text-yellow-600 flex items-center justify-center">
                    Pending
                    <InfoTooltip text="Payments awaiting confirmation from the payment gateway." />
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border border-red-100">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-700">{formatNumber(platformFees?.stats?.failed_payments)}</p>
                  <p className="text-xs text-red-600 flex items-center justify-center">
                    Payment Failed
                    <InfoTooltip text="Declined, expired, or failed payment attempts." />
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
                  <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(platformFees?.stats?.platform_fee_last_30_days)}</p>
                  <p className="text-xs text-emerald-600 flex items-center justify-center">
                    Last 30d
                    <InfoTooltip text="Platform fees collected in the past 30 days." />
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(platformFees?.stats?.platform_fee_last_7_days)}</p>
                  <p className="text-xs text-blue-600 flex items-center justify-center">
                    Last 7d
                    <InfoTooltip text="Platform fees collected in the past 7 days." />
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center border border-purple-100">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(platformFees?.stats?.platform_fee_today)}</p>
                  <p className="text-xs text-purple-600 flex items-center justify-center">
                    Today
                    <InfoTooltip text="Platform fees collected today (last 24 hours)." />
                  </p>
                </div>
              </div>

              {/* Payment Volume by Period */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-green-600" />
                    Platform Fee by Period
                    <InfoTooltip text="Your platform's fee earnings breakdown by different time periods." />
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Last 30 Days
                      </span>
                      <span className="font-bold text-green-600 text-lg">{formatCurrency(platformFees?.stats?.platform_fee_last_30_days)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Last 7 Days
                      </span>
                      <span className="font-bold text-blue-600 text-lg">{formatCurrency(platformFees?.stats?.platform_fee_last_7_days)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Today
                      </span>
                      <span className="font-bold text-purple-600 text-lg">{formatCurrency(platformFees?.stats?.platform_fee_today)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Payment Volume by Period
                    <InfoTooltip text="Total gross payment amounts processed before fees are deducted." />
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Last 30 Days
                      </span>
                      <span className="font-bold text-gray-700 text-lg">{formatCurrency(platformFees?.stats?.amount_last_30_days)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Last 7 Days
                      </span>
                      <span className="font-bold text-gray-700 text-lg">{formatCurrency(platformFees?.stats?.amount_last_7_days)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Today
                      </span>
                      <span className="font-bold text-gray-700 text-lg">{formatCurrency(platformFees?.stats?.amount_today)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
          <button 
            onClick={() => toggleSection('trends')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6" />
              <span className="font-bold text-lg">Revenue Trends</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Last {period} days</span>
            </div>
            {expandedSections.trends ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.trends && (
            <div className="p-6">
              {platformFees?.trend?.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={platformFees.trend.map(t => ({
                      ...t,
                      date: formatDate(t.date),
                      platform_fee: parseFloat(t.platform_fee || 0),
                      total_amount: parseFloat(t.total_amount || 0)
                    }))}>
                      <defs>
                        <linearGradient id="colorPlatformFee" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="total_amount" 
                        name="Payment Volume"
                        stroke="#3b82f6" 
                        fill="url(#colorVolume)" 
                        strokeWidth={2} 
                      />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="platform_fee" 
                        name="Platform Fee"
                        stroke="#10b981" 
                        fill="url(#colorPlatformFee)" 
                        strokeWidth={2} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">No trend data available</p>
                    <p className="text-sm">Revenue trends will appear as payments are processed</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gateway Distribution & Subscription Stats */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Gateway Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <button 
              onClick={() => toggleSection('gateways')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6" />
                <span className="font-bold text-lg">Payment Gateways</span>
              </div>
              {expandedSections.gateways ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.gateways && (
              <div className="p-6">
                {platformFees?.byGateway?.length > 0 ? (
                  <div className="space-y-4">
                    {platformFees.byGateway.map((gateway, idx) => {
                      const total = platformFees.byGateway.reduce((a, b) => a + parseFloat(b.total_platform_fee || 0), 0);
                      const percentage = total > 0 ? ((parseFloat(gateway.total_platform_fee) / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
                                style={{ backgroundColor: GATEWAY_COLORS[gateway.gateway?.toLowerCase()] || GATEWAY_COLORS.unknown }}
                              >
                                {getGatewayIcon(gateway.gateway)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 capitalize">{gateway.gateway || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{gateway.payment_count} payments</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(gateway.total_platform_fee)}</p>
                              <p className="text-sm text-gray-500">{percentage}% of total</p>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: GATEWAY_COLORS[gateway.gateway?.toLowerCase()] || GATEWAY_COLORS.unknown
                              }}
                            />
                          </div>
                          
                          {/* Details */}
                          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-gray-500 flex items-center justify-center">
                                Volume
                                <InfoTooltip text="Gross payment amount processed through this gateway." />
                              </p>
                              <p className="font-semibold">{formatCurrency(gateway.total_amount)}</p>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-gray-500 flex items-center justify-center">
                                Net
                                <InfoTooltip text="Amount paid to creators via this gateway." />
                              </p>
                              <p className="font-semibold">{formatCurrency(gateway.total_net_amount)}</p>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-gray-500 flex items-center justify-center">
                                Gateway Fee
                                <InfoTooltip text="Processing fees charged by this payment gateway." />
                              </p>
                              <p className="font-semibold">{formatCurrency(parseFloat(gateway.stripe_fees || 0) + parseFloat(gateway.paddle_fees || 0))}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No gateway data available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subscription Stats */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <button 
              onClick={() => toggleSection('subscriptions')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                <span className="font-bold text-lg">Subscription Analytics</span>
              </div>
              {expandedSections.subscriptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.subscriptions && (
              <div className="p-6 space-y-4">
                {/* Subscription Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 flex items-center">
                        Active
                        <InfoTooltip text="Subscriptions currently active - these users are paying customers." />
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">{formatNumber(subscriptions?.stats?.active_subscriptions)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        Total
                        <InfoTooltip text="All subscriptions ever created (includes active, cancelled, and expired)." />
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-700">{formatNumber(subscriptions?.stats?.total_subscriptions)}</p>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                    <span className="text-gray-700 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-purple-500" />
                      Recurring Plans
                      <InfoTooltip text="Monthly, quarterly, or yearly auto-renewing subscriptions." />
                    </span>
                    <span className="font-bold text-purple-600">{formatNumber(subscriptions?.stats?.recurring_count)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                    <span className="text-gray-700 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Pay-as-you-go
                      <InfoTooltip text="Usage-based billing - users are charged based on their actual usage." />
                    </span>
                    <span className="font-bold text-blue-600">{formatNumber(subscriptions?.stats?.pay_as_you_go_count)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
                    <span className="text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Auto-renew Enabled
                      <InfoTooltip text="Subscriptions set to automatically renew at the end of billing cycle." />
                    </span>
                    <span className="font-bold text-green-600">{formatNumber(subscriptions?.stats?.auto_renew_enabled)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg">
                    <span className="text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      Total Usage Revenue
                      <InfoTooltip text="Cumulative revenue from pay-as-you-go usage charges." />
                    </span>
                    <span className="font-bold text-amber-600">{formatCurrency(subscriptions?.stats?.total_usage_revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-transparent rounded-lg">
                    <span className="text-gray-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Unpaid Usage
                      <InfoTooltip text="Outstanding usage charges that haven't been paid yet by users." />
                    </span>
                    <span className="font-bold text-red-600">{formatCurrency(subscriptions?.stats?.total_unpaid_amount)}</span>
                  </div>
                </div>

                {/* New Subscriptions */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    New Subscriptions
                    <InfoTooltip text="Recently created subscriptions by time period." />
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-lg font-bold text-indigo-600">{formatNumber(subscriptions?.stats?.new_subscriptions_30d)}</p>
                      <p className="text-xs text-gray-500">30 days</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{formatNumber(subscriptions?.stats?.new_subscriptions_7d)}</p>
                      <p className="text-xs text-gray-500">7 days</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-lg font-bold text-purple-600">{formatNumber(subscriptions?.stats?.new_subscriptions_today)}</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Elections by Platform Fee */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
          <button 
            onClick={() => toggleSection('topElections')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <span className="font-bold text-lg">Top Elections by Revenue</span>
            </div>
            {expandedSections.topElections ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.topElections && (
            <div className="p-6">
              {platformFees?.topElections?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Election</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Payments</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Volume</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Platform Fee</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Creator Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {platformFees.topElections.map((election, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-4">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              idx === 0 ? 'bg-amber-100 text-amber-700' :
                              idx === 1 ? 'bg-gray-200 text-gray-700' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 truncate max-w-[300px]">
                                {election.election_title || `Election #${election.election_id}`}
                              </p>
                              <p className="text-xs text-gray-500">ID: {election.election_id}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {election.payment_count}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-gray-700 font-medium">
                            {formatCurrency(election.total_amount)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-bold text-emerald-600 text-lg">
                              {formatCurrency(election.total_platform_fee)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-blue-600 font-medium">
                            {formatCurrency(election.total_net_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                      <tr>
                        <td colSpan="3" className="px-4 py-4 font-bold text-gray-800">
                          Total (Top 10)
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-gray-800">
                          {formatCurrency(platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0))}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-600 text-lg">
                          {formatCurrency(platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_platform_fee || 0), 0))}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-blue-600">
                          {formatCurrency(platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_net_amount || 0), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Trophy className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No election revenue data yet</p>
                  <p className="text-sm">Top elections will appear once payments are processed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <button 
            onClick={() => toggleSection('recentPayments')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <span className="font-bold text-lg">Recent Payments</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Last 10</span>
            </div>
            {expandedSections.recentPayments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.recentPayments && (
            <div className="p-6">
              {platformFees?.recentPayments?.length > 0 ? (
                <div className="space-y-3">
                  {platformFees.recentPayments.map((payment, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                          style={{ backgroundColor: GATEWAY_COLORS[payment.gateway_used?.toLowerCase()] || GATEWAY_COLORS.unknown }}
                        >
                          {getGatewayIcon(payment.gateway_used)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 truncate max-w-[250px]">
                            {payment.election_title || `Election #${payment.election_id}`}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(payment.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Platform Fee</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(payment.platform_fee)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No recent payments</p>
                  <p className="text-sm">Payments will appear here as they are processed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                Understanding Platform Revenue
                <InfoTooltip text="This section explains how revenue flows through your platform and what each metric means." />
              </h3>
              <p className="text-gray-600 mt-2">
                Platform revenue comes from two sources: <strong>Platform Fees</strong> (processing fees collected from election payments based on the user's subscription plan - can be fixed or percentage based) 
                and <strong>Subscription Revenue</strong> (payments from users for their subscription plans).
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-700">Platform Fee: Variable per plan</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Net to Creator: After all fees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-gray-700">Processing: Stripe/Paddle fees</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
//last workable codes only to enhance explanation above code
// // src/pages/admin/RevenueAnalyticsPage.jsx
// // Comprehensive Platform Revenue Analytics with Subscriptions & Platform Fees
// import React, { useState } from 'react';
// import {
//   DollarSign, TrendingUp, CreditCard, Users, Wallet, RefreshCw,
//   ChevronDown, ChevronUp, Globe, Trophy, Activity, Clock,
//   CheckCircle, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
//   Percent, PieChart as PieChartIcon, BarChart3, FileText,
//   Zap, Target, TrendingDown, Banknote, Receipt, Building2,
//   CalendarDays, Filter, Download, Eye
// } from 'lucide-react';
// import {
//   PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
//   LineChart, Line, ComposedChart
// } from 'recharts';

// // RTK Query hook
// import { useGetPlatformRevenueReportQuery } from '../../redux/api/analytics/platformAnalyticsApi';

// // Colors
// const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
// const GATEWAY_COLORS = {
//   'stripe': '#635bff',
//   'paddle': '#3b82f6',
//   'paypal': '#003087',
//   'unknown': '#9ca3af'
// };

// export default function RevenueAnalyticsPage() {
//   const [period, setPeriod] = useState(30);
//   const [expandedSections, setExpandedSections] = useState({
//     summary: true,
//     platformFees: true,
//     subscriptions: true,
//     trends: true,
//     topElections: true,
//     recentPayments: true,
//     gateways: true
//   });

//   const { 
//     data: revenueData, 
//     isLoading, 
//     error, 
//     refetch 
//   } = useGetPlatformRevenueReportQuery({ period });

//   const revenue = revenueData?.data;
//   const summary = revenue?.summary;
//   const subscriptions = revenue?.subscriptions;
//   const platformFees = revenue?.platformFees;

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   };

//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return '$0.00';
//     return '$' + parseFloat(amount).toLocaleString(undefined, { 
//       minimumFractionDigits: 2, 
//       maximumFractionDigits: 2 
//     });
//   };

//   const formatNumber = (num) => {
//     if (!num) return '0';
//     const n = parseFloat(num);
//     if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
//     if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
//     return n.toLocaleString();
//   };

//   const formatDate = (date) => {
//     if (!date) return '-';
//     return new Date(date).toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   const formatDateTime = (date) => {
//     if (!date) return '-';
//     return new Date(date).toLocaleString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'completed': 'bg-green-100 text-green-700',
//       'success': 'bg-green-100 text-green-700',
//       'succeeded': 'bg-green-100 text-green-700',
//       'pending': 'bg-yellow-100 text-yellow-700',
//       'failed': 'bg-red-100 text-red-700',
//       'refunded': 'bg-purple-100 text-purple-700'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-700';
//   };

//   const getGatewayIcon = (gateway) => {
//     const icons = {
//       'stripe': '💳',
//       'paddle': '🏓',
//       'paypal': '🅿️'
//     };
//     return icons[gateway?.toLowerCase()] || '💰';
//   };

//   // Prepare chart data
//   const revenueDistributionData = [
//     { 
//       name: 'Platform Fees', 
//       value: parseFloat(summary?.total_platform_fee_revenue || 0),
//       color: '#10b981'
//     },
//     { 
//       name: 'Subscription Usage', 
//       value: parseFloat(summary?.total_subscription_usage_revenue || 0),
//       color: '#8b5cf6'
//     }
//   ].filter(item => item.value > 0);

//   const feeBreakdownData = [
//     { 
//       name: 'Platform Revenue', 
//       value: parseFloat(summary?.total_platform_fee_revenue || 0),
//       color: '#10b981'
//     },
//     { 
//       name: 'Creator Earnings', 
//       value: parseFloat(summary?.total_net_to_creators || 0),
//       color: '#3b82f6'
//     },
//     { 
//       name: 'Processing Fees', 
//       value: parseFloat(summary?.total_processing_fees || 0),
//       color: '#f59e0b'
//     }
//   ].filter(item => item.value > 0);

//   // Custom Tooltip for charts
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white px-4 py-3 shadow-xl rounded-lg border border-gray-200">
//           <p className="font-semibold text-gray-900 mb-2">{label}</p>
//           {payload.map((entry, index) => (
//             <p key={index} className="text-sm" style={{ color: entry.color }}>
//               {entry.name}: {formatCurrency(entry.value)}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   const PieTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const total = revenueDistributionData.reduce((a, b) => a + b.value, 0) || 1;
//       const percentage = ((payload[0].value / total) * 100).toFixed(1);
//       return (
//         <div className="bg-white px-4 py-3 shadow-xl rounded-lg border border-gray-200">
//           <p className="font-semibold text-gray-900">{payload[0].name}</p>
//           <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
//             {formatCurrency(payload[0].value)}
//           </p>
//           <p className="text-sm text-gray-500">{percentage}% of total</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="relative">
//             <DollarSign className="w-16 h-16 text-emerald-200 mx-auto" />
//             <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//           </div>
//           <p className="mt-4 text-gray-600 font-medium">Loading revenue analytics...</p>
//           <p className="text-sm text-gray-400">Crunching the numbers</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
//           <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Revenue Data</h2>
//           <p className="text-gray-600 mb-4">{error?.data?.message || 'An unexpected error occurred'}</p>
//           <button 
//             onClick={refetch}
//             className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 mx-auto"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-12">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold flex items-center gap-3">
//                 <div className="p-2 bg-white/20 rounded-lg">
//                   <DollarSign className="w-8 h-8" />
//                 </div>
//                 Revenue Analytics
//               </h1>
//               <p className="text-emerald-100 mt-2">
//                 Comprehensive platform earnings from subscriptions and election fees
//               </p>
//               {revenue?.generatedAt && (
//                 <p className="text-xs text-emerald-200 mt-2 flex items-center gap-1">
//                   <Clock className="w-3 h-3" />
//                   Last updated: {new Date(revenue.generatedAt).toLocaleString()}
//                 </p>
//               )}
//             </div>
//             <div className="flex items-center gap-3">
//               <select 
//                 value={period} 
//                 onChange={(e) => setPeriod(parseInt(e.target.value))}
//                 className="px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
//               >
//                 <option value={7} className="text-gray-900">Last 7 days</option>
//                 <option value={30} className="text-gray-900">Last 30 days</option>
//                 <option value={90} className="text-gray-900">Last 90 days</option>
//                 <option value={365} className="text-gray-900">Last year</option>
//               </select>
//               <button 
//                 onClick={refetch}
//                 disabled={isLoading}
//                 className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition font-medium disabled:opacity-50"
//               >
//                 <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {/* Quick Stats Bar */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
//             <div className="text-center">
//               <p className="text-4xl font-bold">{formatCurrency(summary?.total_platform_revenue)}</p>
//               <p className="text-sm text-emerald-200 mt-1">Total Platform Revenue</p>
//             </div>
//             <div className="text-center">
//               <p className="text-4xl font-bold text-green-300">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
//               <p className="text-sm text-emerald-200 mt-1">Platform Fees Earned</p>
//             </div>
//             <div className="text-center">
//               <p className="text-4xl font-bold text-blue-300">{formatCurrency(summary?.total_payment_volume)}</p>
//               <p className="text-sm text-emerald-200 mt-1">Total Payment Volume</p>
//             </div>
//             <div className="text-center">
//               <p className="text-4xl font-bold text-purple-300">{formatNumber(platformFees?.stats?.successful_payments)}</p>
//               <p className="text-sm text-emerald-200 mt-1">Successful Payments</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
//         {/* Revenue Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {/* Total Platform Revenue */}
//           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-white/20 rounded-xl">
//                 <Wallet className="w-8 h-8" />
//               </div>
//               <span className="text-xs bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
//                 <ArrowUpRight className="w-3 h-3" />
//                 All Time
//               </span>
//             </div>
//             <p className="text-4xl font-bold">{formatCurrency(summary?.total_platform_revenue)}</p>
//             <p className="text-emerald-100 mt-2 text-sm">Total Platform Revenue</p>
//             <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-sm">
//               <div>
//                 <p className="text-emerald-200">This Period</p>
//                 <p className="font-semibold">{formatCurrency(summary?.platform_fee_this_period)}</p>
//               </div>
//               <div>
//                 <p className="text-emerald-200">Volume</p>
//                 <p className="font-semibold">{formatCurrency(summary?.total_payment_volume)}</p>
//               </div>
//             </div>
//           </div>

//           {/* Platform Fee Revenue */}
//           <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-white/20 rounded-xl">
//                 <Percent className="w-8 h-8" />
//               </div>
//               <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
//                 {summary?.platform_fee_percentage}%
//               </span>
//             </div>
//             <p className="text-4xl font-bold">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
//             <p className="text-green-100 mt-2 text-sm">Platform Fee Revenue</p>
//             <div className="mt-4 pt-4 border-t border-white/20">
//               <div className="flex justify-between text-sm">
//                 <span className="text-green-200">From election payments</span>
//                 <span className="font-semibold">{formatNumber(platformFees?.stats?.successful_payments)} txns</span>
//               </div>
//             </div>
//           </div>

//           {/* Creator Earnings */}
//           <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-white/20 rounded-xl">
//                 <Users className="w-8 h-8" />
//               </div>
//               <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
//                 Net Amount
//               </span>
//             </div>
//             <p className="text-4xl font-bold">{formatCurrency(summary?.total_net_to_creators)}</p>
//             <p className="text-blue-100 mt-2 text-sm">Creator Earnings</p>
//             <div className="mt-4 pt-4 border-t border-white/20">
//               <div className="flex justify-between text-sm">
//                 <span className="text-blue-200">After all fees</span>
//                 <span className="font-semibold">Paid to creators</span>
//               </div>
//             </div>
//           </div>

//           {/* Processing Fees */}
//           <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-white/20 rounded-xl">
//                 <CreditCard className="w-8 h-8" />
//               </div>
//               <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
//                 Gateway Fees
//               </span>
//             </div>
//             <p className="text-4xl font-bold">{formatCurrency(summary?.total_processing_fees)}</p>
//             <p className="text-amber-100 mt-2 text-sm">Processing Fees</p>
//             <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-sm">
//               <div>
//                 <p className="text-amber-200">Stripe</p>
//                 <p className="font-semibold">{formatCurrency(platformFees?.stats?.total_stripe_fees)}</p>
//               </div>
//               <div>
//                 <p className="text-amber-200">Paddle</p>
//                 <p className="font-semibold">{formatCurrency(platformFees?.stats?.total_paddle_fees)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Revenue Distribution & Fee Breakdown */}
//         <div className="grid lg:grid-cols-2 gap-6 mb-6">
//           {/* Revenue Distribution Pie */}
//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b flex items-center justify-between">
//               <h3 className="font-bold text-gray-900 flex items-center gap-2">
//                 <PieChartIcon className="w-5 h-5 text-emerald-600" />
//                 Revenue Distribution
//               </h3>
//             </div>
//             <div className="p-6">
//               {revenueDistributionData.length > 0 ? (
//                 <div className="h-72">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={revenueDistributionData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={70}
//                         outerRadius={100}
//                         paddingAngle={5}
//                         dataKey="value"
//                       >
//                         {revenueDistributionData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip content={<PieTooltip />} />
//                       <Legend 
//                         formatter={(value) => <span className="text-gray-700">{value}</span>}
//                       />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               ) : (
//                 <div className="h-72 flex items-center justify-center text-gray-400">
//                   <div className="text-center">
//                     <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                     <p>No revenue data yet</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* Legend Details */}
//               <div className="mt-4 grid grid-cols-2 gap-4">
//                 <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
//                     <span className="text-sm font-medium text-gray-700">Platform Fees</span>
//                   </div>
//                   <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
//                   <p className="text-xs text-gray-500 mt-1">{summary?.platform_fee_percentage}% of total</p>
//                 </div>
//                 <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-3 h-3 rounded-full bg-purple-500"></div>
//                     <span className="text-sm font-medium text-gray-700">Subscription Usage</span>
//                   </div>
//                   <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary?.total_subscription_usage_revenue)}</p>
//                   <p className="text-xs text-gray-500 mt-1">{summary?.subscription_percentage}% of total</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Payment Volume Breakdown */}
//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between">
//               <h3 className="font-bold text-gray-900 flex items-center gap-2">
//                 <BarChart3 className="w-5 h-5 text-blue-600" />
//                 Payment Volume Breakdown
//               </h3>
//             </div>
//             <div className="p-6">
//               {feeBreakdownData.length > 0 ? (
//                 <div className="h-72">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={feeBreakdownData} layout="vertical">
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                       <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} />
//                       <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
//                       <Tooltip formatter={(value) => formatCurrency(value)} />
//                       <Bar dataKey="value" radius={[0, 8, 8, 0]}>
//                         {feeBreakdownData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               ) : (
//                 <div className="h-72 flex items-center justify-center text-gray-400">
//                   <div className="text-center">
//                     <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                     <p>No payment data yet</p>
//                   </div>
//                 </div>
//               )}

//               {/* Quick Stats */}
//               <div className="mt-4 grid grid-cols-3 gap-3">
//                 <div className="p-3 bg-green-50 rounded-lg text-center">
//                   <p className="text-xs text-green-600 font-medium">Platform (5%)</p>
//                   <p className="text-lg font-bold text-green-700">{formatCurrency(summary?.total_platform_fee_revenue)}</p>
//                 </div>
//                 <div className="p-3 bg-blue-50 rounded-lg text-center">
//                   <p className="text-xs text-blue-600 font-medium">To Creators</p>
//                   <p className="text-lg font-bold text-blue-700">{formatCurrency(summary?.total_net_to_creators)}</p>
//                 </div>
//                 <div className="p-3 bg-amber-50 rounded-lg text-center">
//                   <p className="text-xs text-amber-600 font-medium">Gateway Fees</p>
//                   <p className="text-lg font-bold text-amber-700">{formatCurrency(summary?.total_processing_fees)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Platform Fee Stats Section */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
//           <button 
//             onClick={() => toggleSection('platformFees')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 text-white"
//           >
//             <div className="flex items-center gap-3">
//               <Percent className="w-6 h-6" />
//               <span className="font-bold text-lg">Platform Fee Analytics</span>
//               <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Election Payments</span>
//             </div>
//             {expandedSections.platformFees ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//           </button>
          
//           {expandedSections.platformFees && (
//             <div className="p-6 space-y-6">
//               {/* Platform Fee Stats Grid */}
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
//                   <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
//                   <p className="text-2xl font-bold text-green-700">{formatNumber(platformFees?.stats?.successful_payments)}</p>
//                   <p className="text-xs text-green-600">Successful</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 text-center border border-yellow-100">
//                   <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
//                   <p className="text-2xl font-bold text-yellow-700">{formatNumber(platformFees?.stats?.pending_payments)}</p>
//                   <p className="text-xs text-yellow-600">Pending</p>
//                 </div>
//                 {/* <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border border-red-100">
//                   <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
//                   <p className="text-2xl font-bold text-red-700">{formatNumber(platformFees?.stats?.failed_payments)}</p>
//                   <p className="text-xs text-red-600">Failed</p>
//                 </div> */}
//                 <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border border-red-100">
//   <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
//   <p className="text-2xl font-bold text-red-700">{formatNumber(platformFees?.stats?.failed_payments)}</p>
//   <p className="text-xs text-red-600">Payment Failed</p>
// </div>
//                 <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
//                   <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
//                   <p className="text-2xl font-bold text-emerald-700">{formatCurrency(platformFees?.stats?.platform_fee_last_30_days)}</p>
//                   <p className="text-xs text-emerald-600">Last 30d</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
//                   <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
//                   <p className="text-2xl font-bold text-blue-700">{formatCurrency(platformFees?.stats?.platform_fee_last_7_days)}</p>
//                   <p className="text-xs text-blue-600">Last 7d</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center border border-purple-100">
//                   <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
//                   <p className="text-2xl font-bold text-purple-700">{formatCurrency(platformFees?.stats?.platform_fee_today)}</p>
//                   <p className="text-xs text-purple-600">Today</p>
//                 </div>
//               </div>

//               {/* Payment Volume by Period */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="bg-gray-50 rounded-xl p-5">
//                   <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <Banknote className="w-5 h-5 text-green-600" />
//                     Platform Fee by Period
//                   </h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
//                       <span className="text-gray-700 flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4 text-gray-400" />
//                         Last 30 Days
//                       </span>
//                       <span className="font-bold text-green-600 text-lg">{formatCurrency(platformFees?.stats?.platform_fee_last_30_days)}</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
//                       <span className="text-gray-700 flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4 text-gray-400" />
//                         Last 7 Days
//                       </span>
//                       <span className="font-bold text-blue-600 text-lg">{formatCurrency(platformFees?.stats?.platform_fee_last_7_days)}</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
//                       <span className="text-gray-700 flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4 text-gray-400" />
//                         Today
//                       </span>
//                       <span className="font-bold text-purple-600 text-lg">{formatCurrency(platformFees?.stats?.platform_fee_today)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-5">
//                   <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <Receipt className="w-5 h-5 text-blue-600" />
//                     Payment Volume by Period
//                   </h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
//                       <span className="text-gray-700 flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4 text-gray-400" />
//                         Last 30 Days
//                       </span>
//                       <span className="font-bold text-gray-700 text-lg">{formatCurrency(platformFees?.stats?.amount_last_30_days)}</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
//                       <span className="text-gray-700 flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4 text-gray-400" />
//                         Last 7 Days
//                       </span>
//                       <span className="font-bold text-gray-700 text-lg">{formatCurrency(platformFees?.stats?.amount_last_7_days)}</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
//                       <span className="text-gray-700 flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4 text-gray-400" />
//                         Today
//                       </span>
//                       <span className="font-bold text-gray-700 text-lg">{formatCurrency(platformFees?.stats?.amount_today)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Revenue Trend Chart */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
//           <button 
//             onClick={() => toggleSection('trends')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//           >
//             <div className="flex items-center gap-3">
//               <TrendingUp className="w-6 h-6" />
//               <span className="font-bold text-lg">Revenue Trends</span>
//               <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Last {period} days</span>
//             </div>
//             {expandedSections.trends ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//           </button>
          
//           {expandedSections.trends && (
//             <div className="p-6">
//               {platformFees?.trend?.length > 0 ? (
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <ComposedChart data={platformFees.trend.map(t => ({
//                       ...t,
//                       date: formatDate(t.date),
//                       platform_fee: parseFloat(t.platform_fee || 0),
//                       total_amount: parseFloat(t.total_amount || 0)
//                     }))}>
//                       <defs>
//                         <linearGradient id="colorPlatformFee" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
//                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
//                         </linearGradient>
//                         <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                       <XAxis dataKey="date" tick={{ fontSize: 12 }} />
//                       <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
//                       <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend />
//                       <Area 
//                         yAxisId="right"
//                         type="monotone" 
//                         dataKey="total_amount" 
//                         name="Payment Volume"
//                         stroke="#3b82f6" 
//                         fill="url(#colorVolume)" 
//                         strokeWidth={2} 
//                       />
//                       <Area 
//                         yAxisId="left"
//                         type="monotone" 
//                         dataKey="platform_fee" 
//                         name="Platform Fee"
//                         stroke="#10b981" 
//                         fill="url(#colorPlatformFee)" 
//                         strokeWidth={2} 
//                       />
//                     </ComposedChart>
//                   </ResponsiveContainer>
//                 </div>
//               ) : (
//                 <div className="h-80 flex items-center justify-center text-gray-400">
//                   <div className="text-center">
//                     <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-50" />
//                     <p className="text-lg">No trend data available</p>
//                     <p className="text-sm">Revenue trends will appear as payments are processed</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Gateway Distribution & Subscription Stats */}
//         <div className="grid lg:grid-cols-2 gap-6 mb-6">
//           {/* Gateway Distribution */}
//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <button 
//               onClick={() => toggleSection('gateways')}
//               className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
//             >
//               <div className="flex items-center gap-3">
//                 <Globe className="w-6 h-6" />
//                 <span className="font-bold text-lg">Payment Gateways</span>
//               </div>
//               {expandedSections.gateways ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </button>
            
//             {expandedSections.gateways && (
//               <div className="p-6">
//                 {platformFees?.byGateway?.length > 0 ? (
//                   <div className="space-y-4">
//                     {platformFees.byGateway.map((gateway, idx) => {
//                       const total = platformFees.byGateway.reduce((a, b) => a + parseFloat(b.total_platform_fee || 0), 0);
//                       const percentage = total > 0 ? ((parseFloat(gateway.total_platform_fee) / total) * 100).toFixed(1) : 0;
                      
//                       return (
//                         <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-3">
//                               <div 
//                                 className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
//                                 style={{ backgroundColor: GATEWAY_COLORS[gateway.gateway?.toLowerCase()] || GATEWAY_COLORS.unknown }}
//                               >
//                                 {getGatewayIcon(gateway.gateway)}
//                               </div>
//                               <div>
//                                 <p className="font-bold text-gray-900 capitalize">{gateway.gateway || 'Unknown'}</p>
//                                 <p className="text-sm text-gray-500">{gateway.payment_count} payments</p>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-2xl font-bold text-emerald-600">{formatCurrency(gateway.total_platform_fee)}</p>
//                               <p className="text-sm text-gray-500">{percentage}% of total</p>
//                             </div>
//                           </div>
                          
//                           {/* Progress bar */}
//                           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                             <div 
//                               className="h-full rounded-full transition-all"
//                               style={{ 
//                                 width: `${percentage}%`,
//                                 backgroundColor: GATEWAY_COLORS[gateway.gateway?.toLowerCase()] || GATEWAY_COLORS.unknown
//                               }}
//                             />
//                           </div>
                          
//                           {/* Details */}
//                           <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
//                             <div className="text-center p-2 bg-white rounded-lg">
//                               <p className="text-gray-500">Volume</p>
//                               <p className="font-semibold">{formatCurrency(gateway.total_amount)}</p>
//                             </div>
//                             <div className="text-center p-2 bg-white rounded-lg">
//                               <p className="text-gray-500">Net</p>
//                               <p className="font-semibold">{formatCurrency(gateway.total_net_amount)}</p>
//                             </div>
//                             <div className="text-center p-2 bg-white rounded-lg">
//                               <p className="text-gray-500">Gateway Fee</p>
//                               <p className="font-semibold">{formatCurrency(parseFloat(gateway.stripe_fees || 0) + parseFloat(gateway.paddle_fees || 0))}</p>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12 text-gray-400">
//                     <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                     <p>No gateway data available</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Subscription Stats */}
//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <button 
//               onClick={() => toggleSection('subscriptions')}
//               className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 text-white"
//             >
//               <div className="flex items-center gap-3">
//                 <CreditCard className="w-6 h-6" />
//                 <span className="font-bold text-lg">Subscription Analytics</span>
//               </div>
//               {expandedSections.subscriptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//             </button>
            
//             {expandedSections.subscriptions && (
//               <div className="p-6 space-y-4">
//                 {/* Subscription Summary */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
//                     <div className="flex items-center gap-2 mb-2">
//                       <CheckCircle className="w-5 h-5 text-green-600" />
//                       <span className="text-sm font-medium text-green-700">Active</span>
//                     </div>
//                     <p className="text-3xl font-bold text-green-700">{formatNumber(subscriptions?.stats?.active_subscriptions)}</p>
//                   </div>
//                   <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Users className="w-5 h-5 text-gray-600" />
//                       <span className="text-sm font-medium text-gray-700">Total</span>
//                     </div>
//                     <p className="text-3xl font-bold text-gray-700">{formatNumber(subscriptions?.stats?.total_subscriptions)}</p>
//                   </div>
//                 </div>

//                 {/* Subscription Details */}
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
//                     <span className="text-gray-700 flex items-center gap-2">
//                       <RefreshCw className="w-4 h-4 text-purple-500" />
//                       Recurring Plans
//                     </span>
//                     <span className="font-bold text-purple-600">{formatNumber(subscriptions?.stats?.recurring_count)}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
//                     <span className="text-gray-700 flex items-center gap-2">
//                       <Zap className="w-4 h-4 text-blue-500" />
//                       Pay-as-you-go
//                     </span>
//                     <span className="font-bold text-blue-600">{formatNumber(subscriptions?.stats?.pay_as_you_go_count)}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
//                     <span className="text-gray-700 flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-green-500" />
//                       Auto-renew Enabled
//                     </span>
//                     <span className="font-bold text-green-600">{formatNumber(subscriptions?.stats?.auto_renew_enabled)}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg">
//                     <span className="text-gray-700 flex items-center gap-2">
//                       <DollarSign className="w-4 h-4 text-amber-500" />
//                       Total Usage Revenue
//                     </span>
//                     <span className="font-bold text-amber-600">{formatCurrency(subscriptions?.stats?.total_usage_revenue)}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-transparent rounded-lg">
//                     <span className="text-gray-700 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       Unpaid Usage
//                     </span>
//                     <span className="font-bold text-red-600">{formatCurrency(subscriptions?.stats?.total_unpaid_amount)}</span>
//                   </div>
//                 </div>

//                 {/* New Subscriptions */}
//                 <div className="bg-gray-50 rounded-xl p-4">
//                   <h4 className="font-semibold text-gray-800 mb-3">New Subscriptions</h4>
//                   <div className="grid grid-cols-3 gap-3">
//                     <div className="text-center p-2 bg-white rounded-lg">
//                       <p className="text-lg font-bold text-indigo-600">{formatNumber(subscriptions?.stats?.new_subscriptions_30d)}</p>
//                       <p className="text-xs text-gray-500">30 days</p>
//                     </div>
//                     <div className="text-center p-2 bg-white rounded-lg">
//                       <p className="text-lg font-bold text-blue-600">{formatNumber(subscriptions?.stats?.new_subscriptions_7d)}</p>
//                       <p className="text-xs text-gray-500">7 days</p>
//                     </div>
//                     <div className="text-center p-2 bg-white rounded-lg">
//                       <p className="text-lg font-bold text-purple-600">{formatNumber(subscriptions?.stats?.new_subscriptions_today)}</p>
//                       <p className="text-xs text-gray-500">Today</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Top Elections by Platform Fee */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
//           <button 
//             onClick={() => toggleSection('topElections')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white"
//           >
//             <div className="flex items-center gap-3">
//               <Trophy className="w-6 h-6" />
//               <span className="font-bold text-lg">Top Elections by Revenue</span>
//             </div>
//             {expandedSections.topElections ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//           </button>
          
//           {expandedSections.topElections && (
//             <div className="p-6">
//               {platformFees?.topElections?.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b-2 border-gray-200 bg-gray-50">
//                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
//                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Election</th>
//                         <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Payments</th>
//                         <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Volume</th>
//                         <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Platform Fee</th>
//                         <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Creator Net</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {platformFees.topElections.map((election, idx) => (
//                         <tr key={idx} className="hover:bg-gray-50 transition">
//                           <td className="px-4 py-4">
//                             <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
//                               idx === 0 ? 'bg-amber-100 text-amber-700' :
//                               idx === 1 ? 'bg-gray-200 text-gray-700' :
//                               idx === 2 ? 'bg-orange-100 text-orange-700' :
//                               'bg-gray-100 text-gray-600'
//                             }`}>
//                               {idx + 1}
//                             </span>
//                           </td>
//                           <td className="px-4 py-4">
//                             <div>
//                               <p className="font-semibold text-gray-900 truncate max-w-[300px]">
//                                 {election.election_title || `Election #${election.election_id}`}
//                               </p>
//                               <p className="text-xs text-gray-500">ID: {election.election_id}</p>
//                             </div>
//                           </td>
//                           <td className="px-4 py-4 text-center">
//                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
//                               {election.payment_count}
//                             </span>
//                           </td>
//                           <td className="px-4 py-4 text-right text-gray-700 font-medium">
//                             {formatCurrency(election.total_amount)}
//                           </td>
//                           <td className="px-4 py-4 text-right">
//                             <span className="font-bold text-emerald-600 text-lg">
//                               {formatCurrency(election.total_platform_fee)}
//                             </span>
//                           </td>
//                           <td className="px-4 py-4 text-right text-blue-600 font-medium">
//                             {formatCurrency(election.total_net_amount)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot className="bg-gray-50 border-t-2 border-gray-200">
//                       <tr>
//                         <td colSpan="3" className="px-4 py-4 font-bold text-gray-800">
//                           Total (Top 10)
//                         </td>
//                         <td className="px-4 py-4 text-right font-bold text-gray-800">
//                           {formatCurrency(platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0))}
//                         </td>
//                         <td className="px-4 py-4 text-right font-bold text-emerald-600 text-lg">
//                           {formatCurrency(platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_platform_fee || 0), 0))}
//                         </td>
//                         <td className="px-4 py-4 text-right font-bold text-blue-600">
//                           {formatCurrency(platformFees.topElections.reduce((sum, e) => sum + parseFloat(e.total_net_amount || 0), 0))}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-gray-400">
//                   <Trophy className="w-16 h-16 mx-auto mb-3 opacity-50" />
//                   <p className="text-lg">No election revenue data yet</p>
//                   <p className="text-sm">Top elections will appear once payments are processed</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Recent Payments */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <button 
//             onClick={() => toggleSection('recentPayments')}
//             className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
//           >
//             <div className="flex items-center gap-3">
//               <Activity className="w-6 h-6" />
//               <span className="font-bold text-lg">Recent Payments</span>
//               <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Last 10</span>
//             </div>
//             {expandedSections.recentPayments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//           </button>
          
//           {expandedSections.recentPayments && (
//             <div className="p-6">
//               {platformFees?.recentPayments?.length > 0 ? (
//                 <div className="space-y-3">
//                   {platformFees.recentPayments.map((payment, idx) => (
//                     <div 
//                       key={idx} 
//                       className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div 
//                           className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
//                           style={{ backgroundColor: GATEWAY_COLORS[payment.gateway_used?.toLowerCase()] || GATEWAY_COLORS.unknown }}
//                         >
//                           {getGatewayIcon(payment.gateway_used)}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-900 truncate max-w-[250px]">
//                             {payment.election_title || `Election #${payment.election_id}`}
//                           </p>
//                           <div className="flex items-center gap-2 text-sm text-gray-500">
//                             <Clock className="w-3 h-3" />
//                             {formatDateTime(payment.created_at)}
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center gap-6">
//                         <div className="text-right">
//                           <p className="text-sm text-gray-500">Amount</p>
//                           <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm text-gray-500">Platform Fee</p>
//                           <p className="font-bold text-emerald-600">{formatCurrency(payment.platform_fee)}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm text-gray-500">Status</p>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
//                             {payment.status}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-gray-400">
//                   <Activity className="w-16 h-16 mx-auto mb-3 opacity-50" />
//                   <p className="text-lg">No recent payments</p>
//                   <p className="text-sm">Payments will appear here as they are processed</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Footer Info */}
//         <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
//           <div className="flex items-start gap-4">
//             <div className="p-3 bg-emerald-100 rounded-xl">
//               <DollarSign className="w-8 h-8 text-emerald-600" />
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-900 text-lg">Understanding Platform Revenue</h3>
//               <p className="text-gray-600 mt-2">
//                 Platform revenue comes from two sources: <strong>Platform Fees</strong>  
//                 and <strong>Subscription Usage</strong> (pay-as-you-go billing for premium features).
//               </p>
//               <div className="mt-4 grid sm:grid-cols-3 gap-4">
//                 <div className="flex items-center gap-2 text-sm">
//                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
//                   <span className="text-gray-700">Platform Fee: % or fixed payments</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   <span className="text-gray-700">Net to Creator: After all fees</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <div className="w-3 h-3 rounded-full bg-amber-500"></div>
//                   <span className="text-gray-700">Processing: Stripe/Paddle fees</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
