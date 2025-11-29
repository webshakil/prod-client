// src/pages/admin/RefundManagementPage.jsx
// Refund Management - Empty State with Policy Information
import React, { useState } from 'react';
import {
  RefreshCw, DollarSign, Shield, AlertCircle, CheckCircle,
  XCircle, Clock, FileText, Users, Ban, CalendarX,
  ArrowLeftRight, Wallet, Info, HelpCircle, ChevronRight,
  Search, Filter, Download, Bell, Lock,
  CreditCard, Building2, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function RefundManagementPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Empty refund data
  /*eslint-disable*/
  const refunds = [];
  const stats = {
    total_refunds: 0,
    pending_refunds: 0,
    completed_refunds: 0,
    total_amount_refunded: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ArrowLeftRight className="w-8 h-8" />
                </div>
                Refund Management
              </h1>
              <p className="text-rose-100 mt-2">
                Track and manage voter refunds for cancelled or failed elections
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white hover:bg-white/20 transition">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition font-medium">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-4xl font-bold">{stats.total_refunds}</p>
              <p className="text-sm text-rose-200 mt-1">Total Refunds</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-300">{stats.pending_refunds}</p>
              <p className="text-sm text-rose-200 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-300">{stats.completed_refunds}</p>
              <p className="text-sm text-rose-200 mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">${stats.total_amount_refunded.toFixed(2)}</p>
              <p className="text-sm text-rose-200 mt-1">Amount Refunded</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border p-2 mb-6 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Refunds', icon: FileText },
            { id: 'pending', label: 'Pending', icon: Clock },
            { id: 'completed', label: 'Completed', icon: CheckCircle },
            { id: 'failed', label: 'Failed', icon: XCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
                activeTab === tab.id
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          
          <div className="flex-1"></div>
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search refunds..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none w-64"
            />
          </div>
        </div>

        {/* Empty State - Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-12 text-center">
            {/* Animated Icon */}
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-rose-500" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Refunds Required Yet! 🎉
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Great news! All elections are running smoothly and no refunds have been requested or processed.
              This page will show refund records when they occur.
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 font-medium mb-8">
              <CheckCircle className="w-5 h-5" />
              All Systems Operating Normally
            </div>
          </div>

          {/* Refund Policy Section */}
          <div className="border-t bg-gradient-to-b from-gray-50 to-white">
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6 text-rose-600" />
                  Automatic Refund Policy
                </h3>
                <p className="text-gray-600 mt-2">
                  Our platform automatically handles refunds in the following scenarios
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Scenario 1: Election Cancelled */}
                <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <CalendarX className="w-8 h-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Election Cancelled
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        When an election creator cancels their election before it completes
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-amber-500" />
                          <span className="text-gray-700">Participation fees refunded to all voters</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-amber-500" />
                          <span className="text-gray-700">Automatic processing within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-amber-500" />
                          <span className="text-gray-700">Refund to original payment method</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                          <Info className="w-4 h-4" />
                          Voters notified via email automatically
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario 2: Failed Election */}
                <div className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Failed Election
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        When an election fails due to technical issues or policy violations
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">Full refund from blocked escrow account</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">All voters receive automatic refunds</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">Platform fees also refunded</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                          <Lock className="w-4 h-4" />
                          Funds held securely until resolution
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How Refunds Work */}
          <div className="border-t p-8 bg-gradient-to-br from-rose-50 to-pink-50">
            <h3 className="text-lg font-bold text-gray-900 text-center mb-8 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-rose-600" />
              How Refunds Work
            </h3>

            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-rose-200">
                    <Ban className="w-8 h-8 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">1. Trigger Event</h4>
                  <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
                    Election cancelled or failed
                  </p>
                </div>

                <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-blue-200">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">2. Identify Voters</h4>
                  <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
                    System finds all affected voters
                  </p>
                </div>

                <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-amber-200">
                    <Wallet className="w-8 h-8 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">3. Process Refund</h4>
                  <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
                    Automatic refund initiated
                  </p>
                </div>

                <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">4. Completed</h4>
                  <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
                    Funds returned to voters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Timeline Info */}
          <div className="border-t p-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Expected Refund Timeline
              </h3>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    <span className="font-semibold text-gray-900">Stripe Payments</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">5-10 days</p>
                  <p className="text-sm text-gray-600 mt-1">Depending on bank processing</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold text-gray-900">Paddle Payments</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">3-7 days</p>
                  <p className="text-sm text-gray-600 mt-1">Faster regional processing</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-gray-900">Platform Balance</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">Instant</p>
                  <p className="text-sm text-gray-600 mt-1">Credited immediately</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Bell className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Need Help with Refunds?</p>
                  <p className="text-sm text-gray-600">Our support team is here to assist</p>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Security */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900">Secure Processing</h4>
            </div>
            <p className="text-sm text-gray-600">
              All refunds are processed through secure payment gateways with bank-level encryption. 
              Your financial data is always protected.
            </p>
          </div>

          {/* Transparency */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900">Full Transparency</h4>
            </div>
            <p className="text-sm text-gray-600">
              Every refund is tracked and documented. Both creators and voters receive 
              detailed notifications about refund status and amounts.
            </p>
          </div>

          {/* Fair Policy */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900">Fair & Automatic</h4>
            </div>
            <p className="text-sm text-gray-600">
              No manual requests needed. When refund conditions are met, our system 
              automatically initiates the process to ensure timely returns.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Info className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Important Note</h3>
              <p className="text-gray-600 mt-1 text-sm">
                Refunds are only applicable for paid elections with participation fees. Free elections do not 
                generate refund records. Platform fees may be partially or fully refunded depending on the 
                circumstances of the cancellation. For disputes or special cases, please contact our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Integration Requirements */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                Live Payment Integration Required
                <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-semibold rounded-full">IMPORTANT</span>
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Automatic refund disbursement requires active payment gateway connections. When an election is cancelled or fails, 
                refunds will be automatically processed and disbursed to users' original payment methods.
              </p>
              
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Stripe</p>
                    <p className="text-xs text-gray-500">Live API keys required</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Paddle</p>
                    <p className="text-xs text-gray-500">Production credentials needed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Bank Account</p>
                    <p className="text-xs text-gray-500">Connected payout account</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">How it works:</span> Once live payment gateways are connected, any election cancellation 
                    or failure will trigger automatic refund processing. Funds are disbursed directly to users' accounts via their 
                    original payment method (Stripe/Paddle) or credited to their platform balance for instant availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// // src/pages/admin/RefundManagementPage.jsx
// // Refund Management - Empty State with Policy Information
// import React, { useState } from 'react';
// import {
//   RefreshCw, DollarSign, Shield, AlertCircle, CheckCircle,
//   XCircle, Clock, FileText, Users, Ban, CalendarX,
//   ArrowLeftRight, Wallet, Info, HelpCircle, ChevronRight,
//   Search, Filter, Download, Bell, Sparkles, Lock,
//   CreditCard, Building2, AlertTriangle, ArrowRight
// } from 'lucide-react';

// export default function RefundManagementPage() {
//   const [activeTab, setActiveTab] = useState('all');

//   // Empty refund data
//   /*eslint-disable*/
//   const refunds = [];
//   const stats = {
//     total_refunds: 0,
//     pending_refunds: 0,
//     completed_refunds: 0,
//     total_amount_refunded: 0
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pb-12">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold flex items-center gap-3">
//                 <div className="p-2 bg-white/20 rounded-lg">
//                   <ArrowLeftRight className="w-8 h-8" />
//                 </div>
//                 Refund Management
//               </h1>
//               <p className="text-rose-100 mt-2">
//                 Track and manage voter refunds for cancelled or failed elections
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white hover:bg-white/20 transition">
//                 <Download className="w-4 h-4" />
//                 Export
//               </button>
//               <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition font-medium">
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {/* Stats Bar */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
//             <div className="text-center">
//               <p className="text-4xl font-bold">{stats.total_refunds}</p>
//               <p className="text-sm text-rose-200 mt-1">Total Refunds</p>
//             </div>
//             <div className="text-center">
//               <p className="text-4xl font-bold text-yellow-300">{stats.pending_refunds}</p>
//               <p className="text-sm text-rose-200 mt-1">Pending</p>
//             </div>
//             <div className="text-center">
//               <p className="text-4xl font-bold text-green-300">{stats.completed_refunds}</p>
//               <p className="text-sm text-rose-200 mt-1">Completed</p>
//             </div>
//             <div className="text-center">
//               <p className="text-4xl font-bold">${stats.total_amount_refunded.toFixed(2)}</p>
//               <p className="text-sm text-rose-200 mt-1">Amount Refunded</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
//         {/* Filter Tabs */}
//         <div className="bg-white rounded-2xl shadow-sm border p-2 mb-6 flex flex-wrap gap-2">
//           {[
//             { id: 'all', label: 'All Refunds', icon: FileText },
//             { id: 'pending', label: 'Pending', icon: Clock },
//             { id: 'completed', label: 'Completed', icon: CheckCircle },
//             { id: 'failed', label: 'Failed', icon: XCircle },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
//                 activeTab === tab.id
//                   ? 'bg-rose-100 text-rose-700'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           ))}
          
//           <div className="flex-1"></div>
          
//           {/* Search */}
//           <div className="relative">
//             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search refunds..."
//               className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none w-64"
//             />
//           </div>
//         </div>

//         {/* Empty State - Main Content */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <div className="p-12 text-center">
//             {/* Animated Icon */}
//             <div className="relative inline-block mb-6">
//               <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
//                 <div className="w-24 h-24 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center">
//                   <Sparkles className="w-12 h-12 text-rose-500" />
//                 </div>
//               </div>
//               <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                 <CheckCircle className="w-6 h-6 text-green-600" />
//               </div>
//             </div>

//             <h2 className="text-2xl font-bold text-gray-900 mb-3">
//               No Refunds Required Yet! 🎉
//             </h2>
//             <p className="text-gray-600 max-w-md mx-auto mb-8">
//               Great news! All elections are running smoothly and no refunds have been requested or processed.
//               This page will show refund records when they occur.
//             </p>

//             {/* Status Badge */}
//             <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 font-medium mb-8">
//               <CheckCircle className="w-5 h-5" />
//               All Systems Operating Normally
//             </div>
//           </div>

//           {/* Refund Policy Section */}
//           <div className="border-t bg-gradient-to-b from-gray-50 to-white">
//             <div className="p-8">
//               <div className="text-center mb-8">
//                 <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
//                   <Shield className="w-6 h-6 text-rose-600" />
//                   Automatic Refund Policy
//                 </h3>
//                 <p className="text-gray-600 mt-2">
//                   Our platform automatically handles refunds in the following scenarios
//                 </p>
//               </div>

//               <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
//                 {/* Scenario 1: Election Cancelled */}
//                 <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm hover:shadow-md transition">
//                   <div className="flex items-start gap-4">
//                     <div className="p-3 bg-amber-100 rounded-xl">
//                       <CalendarX className="w-8 h-8 text-amber-600" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-bold text-gray-900 text-lg mb-2">
//                         Election Cancelled
//                       </h4>
//                       <p className="text-gray-600 text-sm mb-4">
//                         When an election creator cancels their election before it completes
//                       </p>
                      
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2 text-sm">
//                           <ArrowRight className="w-4 h-4 text-amber-500" />
//                           <span className="text-gray-700">Participation fees refunded to all voters</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <ArrowRight className="w-4 h-4 text-amber-500" />
//                           <span className="text-gray-700">Automatic processing within 24 hours</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <ArrowRight className="w-4 h-4 text-amber-500" />
//                           <span className="text-gray-700">Refund to original payment method</span>
//                         </div>
//                       </div>

//                       <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
//                         <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
//                           <Info className="w-4 h-4" />
//                           Voters notified via email automatically
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Scenario 2: Failed Election */}
//                 <div className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-sm hover:shadow-md transition">
//                   <div className="flex items-start gap-4">
//                     <div className="p-3 bg-red-100 rounded-xl">
//                       <AlertTriangle className="w-8 h-8 text-red-600" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-bold text-gray-900 text-lg mb-2">
//                         Failed Election
//                       </h4>
//                       <p className="text-gray-600 text-sm mb-4">
//                         When an election fails due to technical issues or policy violations
//                       </p>
                      
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2 text-sm">
//                           <ArrowRight className="w-4 h-4 text-red-500" />
//                           <span className="text-gray-700">Full refund from blocked escrow account</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <ArrowRight className="w-4 h-4 text-red-500" />
//                           <span className="text-gray-700">All voters receive automatic refunds</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <ArrowRight className="w-4 h-4 text-red-500" />
//                           <span className="text-gray-700">Platform fees also refunded</span>
//                         </div>
//                       </div>

//                       <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
//                         <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
//                           <Lock className="w-4 h-4" />
//                           Funds held securely until resolution
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* How Refunds Work */}
//           <div className="border-t p-8 bg-gradient-to-br from-rose-50 to-pink-50">
//             <h3 className="text-lg font-bold text-gray-900 text-center mb-8 flex items-center justify-center gap-2">
//               <HelpCircle className="w-5 h-5 text-rose-600" />
//               How Refunds Work
//             </h3>

//             <div className="max-w-4xl mx-auto">
//               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//                 {/* Step 1 */}
//                 <div className="flex flex-col items-center text-center">
//                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-rose-200">
//                     <Ban className="w-8 h-8 text-rose-600" />
//                   </div>
//                   <h4 className="font-semibold text-gray-900">1. Trigger Event</h4>
//                   <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
//                     Election cancelled or failed
//                   </p>
//                 </div>

//                 <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />

//                 {/* Step 2 */}
//                 <div className="flex flex-col items-center text-center">
//                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-blue-200">
//                     <Users className="w-8 h-8 text-blue-600" />
//                   </div>
//                   <h4 className="font-semibold text-gray-900">2. Identify Voters</h4>
//                   <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
//                     System finds all affected voters
//                   </p>
//                 </div>

//                 <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />

//                 {/* Step 3 */}
//                 <div className="flex flex-col items-center text-center">
//                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-amber-200">
//                     <Wallet className="w-8 h-8 text-amber-600" />
//                   </div>
//                   <h4 className="font-semibold text-gray-900">3. Process Refund</h4>
//                   <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
//                     Automatic refund initiated
//                   </p>
//                 </div>

//                 <ChevronRight className="w-6 h-6 text-gray-300 hidden md:block" />

//                 {/* Step 4 */}
//                 <div className="flex flex-col items-center text-center">
//                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 border-2 border-green-200">
//                     <CheckCircle className="w-8 h-8 text-green-600" />
//                   </div>
//                   <h4 className="font-semibold text-gray-900">4. Completed</h4>
//                   <p className="text-sm text-gray-600 mt-1 max-w-[150px]">
//                     Funds returned to voters
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Refund Timeline Info */}
//           <div className="border-t p-8">
//             <div className="max-w-4xl mx-auto">
//               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
//                 <Clock className="w-5 h-5 text-gray-600" />
//                 Expected Refund Timeline
//               </h3>

//               <div className="grid sm:grid-cols-3 gap-4">
//                 <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
//                   <div className="flex items-center gap-3 mb-3">
//                     <CreditCard className="w-6 h-6 text-purple-600" />
//                     <span className="font-semibold text-gray-900">Stripe Payments</span>
//                   </div>
//                   <p className="text-3xl font-bold text-purple-600">5-10 days</p>
//                   <p className="text-sm text-gray-600 mt-1">Depending on bank processing</p>
//                 </div>

//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
//                   <div className="flex items-center gap-3 mb-3">
//                     <Building2 className="w-6 h-6 text-blue-600" />
//                     <span className="font-semibold text-gray-900">Paddle Payments</span>
//                   </div>
//                   <p className="text-3xl font-bold text-blue-600">3-7 days</p>
//                   <p className="text-sm text-gray-600 mt-1">Faster regional processing</p>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
//                   <div className="flex items-center gap-3 mb-3">
//                     <Wallet className="w-6 h-6 text-green-600" />
//                     <span className="font-semibold text-gray-900">Platform Balance</span>
//                   </div>
//                   <p className="text-3xl font-bold text-green-600">Instant</p>
//                   <p className="text-sm text-gray-600 mt-1">Credited immediately</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Support Section */}
//           <div className="border-t p-6 bg-gray-50">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-rose-100 rounded-lg">
//                   <Bell className="w-5 h-5 text-rose-600" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">Need Help with Refunds?</p>
//                   <p className="text-sm text-gray-600">Our support team is here to assist</p>
//                 </div>
//               </div>
//               <button className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium flex items-center gap-2">
//                 <HelpCircle className="w-4 h-4" />
//                 Contact Support
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Additional Info Cards */}
//         <div className="grid md:grid-cols-3 gap-6 mt-6">
//           {/* Security */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <Shield className="w-6 h-6 text-green-600" />
//               </div>
//               <h4 className="font-bold text-gray-900">Secure Processing</h4>
//             </div>
//             <p className="text-sm text-gray-600">
//               All refunds are processed through secure payment gateways with bank-level encryption. 
//               Your financial data is always protected.
//             </p>
//           </div>

//           {/* Transparency */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <FileText className="w-6 h-6 text-blue-600" />
//               </div>
//               <h4 className="font-bold text-gray-900">Full Transparency</h4>
//             </div>
//             <p className="text-sm text-gray-600">
//               Every refund is tracked and documented. Both creators and voters receive 
//               detailed notifications about refund status and amounts.
//             </p>
//           </div>

//           {/* Fair Policy */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <DollarSign className="w-6 h-6 text-purple-600" />
//               </div>
//               <h4 className="font-bold text-gray-900">Fair & Automatic</h4>
//             </div>
//             <p className="text-sm text-gray-600">
//               No manual requests needed. When refund conditions are met, our system 
//               automatically initiates the process to ensure timely returns.
//             </p>
//           </div>
//         </div>

//         {/* Footer Note */}
//         <div className="mt-8 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
//           <div className="flex items-start gap-4">
//             <div className="p-3 bg-rose-100 rounded-xl">
//               <Info className="w-6 h-6 text-rose-600" />
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-900">Important Note</h3>
//               <p className="text-gray-600 mt-1 text-sm">
//                 Refunds are only applicable for paid elections with participation fees. Free elections do not 
//                 generate refund records. Platform fees may be partially or fully refunded depending on the 
//                 circumstances of the cancellation. For disputes or special cases, please contact our support team.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
