import React from 'react';
import { Calendar, Clock, Users, Vote, PlayCircle, Play, CheckCircle } from 'lucide-react';

export default function ElectionHeader({ 
  election, 
  formatDate,
  videoUrl,
  videoWatched,
  onWatchVideo
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      {election.topic_image_url && (
        <div className="w-full h-64 md:h-96">
          <img
            src={election.topic_image_url}
            alt={election.title || 'Election'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {election.title || 'Untitled Election'}
            </h1>
            {election.description && (
              <p className="text-gray-600 text-lg">{election.description}</p>
            )}
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            {election.is_free ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full whitespace-nowrap">
                🆓 Free
              </span>
            ) : (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full whitespace-nowrap">
                💰 Paid
              </span>
            )}
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="text-blue-600" size={24} />
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-900">{formatDate(election.start_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="text-green-600" size={24} />
            <div>
              <p className="text-xs text-gray-500">End Date</p>
              <p className="font-semibold text-gray-900">{formatDate(election.end_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Users className="text-purple-600" size={24} />
            <div>
              <p className="text-xs text-gray-500">Total Votes</p>
              <p className="font-semibold text-gray-900">{election.vote_count || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Vote className="text-orange-600" size={24} />
            <div>
              <p className="text-xs text-gray-500">Voting Type</p>
              <p className="font-semibold text-gray-900">
                {election.voting_type ? 
                  election.voting_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                  : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Video Notice */}
        {videoUrl && !videoWatched && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <PlayCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Video Required</h3>
                <p className="text-blue-800 text-sm mb-3">
                  You must watch the election video before you can vote.
                </p>
                <button
                  onClick={onWatchVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  Watch Video Now
                </button>
              </div>
            </div>
          </div>
        )}

        {videoUrl && videoWatched && (
          <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <p className="text-green-800 font-medium">✓ Video watched - You can now proceed to vote</p>
          </div>
        )}
      </div>
    </div>
  );
}