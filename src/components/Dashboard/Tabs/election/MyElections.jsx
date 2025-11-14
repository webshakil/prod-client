// src/components/Dashboard/Tabs/MyElections.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Share2,
  BarChart3,
  Gift,
  Loader
} from 'lucide-react';
import { useGetMyElectionsQuery } from '../../../../redux/api/election/electionApi';
//import { useGetMyElectionsQuery } from '../../../redux/api/election/electionApi';

export default function MyElections() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: electionsData, isLoading, error } = useGetMyElectionsQuery({
    page: 1,
    limit: 100,
    status: null
  });

  // Handle different response structures
  const myElections = electionsData?.elections || electionsData?.data?.elections || electionsData?.data || [];

  console.log('Elections Data:', electionsData);
  console.log('My Elections:', myElections);

  const filteredElections = myElections.filter(election => {
    if (filter === 'all') return true;
    return election.status?.toLowerCase() === filter;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const calculateRevenue = (election) => {
    const votes = election.total_votes || 0;
    const fee = parseFloat(election.general_participation_fee || 0);
    return (votes * fee).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-red-600 mb-4">Error loading elections</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Elections</h1>
          <p className="text-gray-600 mt-1">Manage and track your created elections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Elections</p>
            <BarChart3 className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">{myElections.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active</p>
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {myElections.filter(e => e.status === 'published').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Votes</p>
            <Users className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {myElections.reduce((sum, e) => sum + (e.total_votes || 0), 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${myElections.reduce((sum, e) => sum + parseFloat(calculateRevenue(e)), 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All Elections', count: myElections.length },
            { value: 'published', label: 'Active', count: myElections.filter(e => e.status === 'published').length },
            { value: 'draft', label: 'Drafts', count: myElections.filter(e => e.status === 'draft').length },
            { value: 'completed', label: 'Completed', count: myElections.filter(e => e.status === 'completed').length },
            { value: 'cancelled', label: 'Cancelled', count: myElections.filter(e => e.status === 'cancelled').length },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {filteredElections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No Elections Created Yet' : `No ${filter} Elections`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Start by creating your first election to engage your audience"
              : `You don't have any ${filter} elections at the moment`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => (
            <div
              key={election.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              {election.media_url ? (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  <img
                    src={election.media_url}
                    alt={election.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
                      {election.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                  <span className="text-6xl">🗳️</span>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
                      {election.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {election.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {election.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-purple-600" size={16} />
                    <div>
                      <p className="text-xs text-gray-600">Participants</p>
                      <p className="font-semibold text-gray-900">{election.total_votes || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="text-blue-600" size={16} />
                    <div>
                      <p className="text-xs text-gray-600">Views</p>
                      <p className="font-semibold text-gray-900">{election.views || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Participation Fee</span>
                    <span className="font-semibold text-green-700">
                      ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Total Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      ${calculateRevenue(election)}
                    </span>
                  </div>
                </div>

                {election.is_gamified && (
                  <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-2">
                    <Gift className="text-purple-600" size={20} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Prize Pool</p>
                      <p className="font-semibold text-purple-700">
                        ${parseFloat(election.total_prize_pool || 0).toFixed(2)}
                      </p>
                    </div>
                    {election.has_lottery_ended ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <Clock className="text-orange-600" size={20} />
                    )}
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar size={14} />
                    <span>Start: {new Date(election.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>End: {new Date(election.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {election.voting_type || 'plurality'}
                  </span>
                  {election.allow_vote_editing && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      Editable
                    </span>
                  )}
                  {election.is_biometric_required && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Biometric
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => navigate(`/election/${election.id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard?tab=all-elections&view=${election.id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                  >
                    <Edit size={16} />
                    Manage
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/election/${election.id}`;
                      navigator.clipboard.writeText(url);
                      alert('Election link copied!');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={() => navigate('/dashboard?tab=creator-wallet')}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition text-sm"
                  >
                    <TrendingUp size={16} />
                    Revenue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}