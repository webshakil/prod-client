// src/components/election/Step2Configuration/Step2Configuration-Part4-Final.jsx
// Contains: PreviewSettings, ResultsFeatures
import React from 'react';
import {
  FaEye,
  FaEyeSlash,
  FaDollarSign,
  FaGift,
  FaExclamationTriangle,
  FaEdit,
  FaLock
} from 'react-icons/fa';

// ============================================
// PREVIEW SETTINGS COMPONENT
// ============================================
export function PreviewSettings({
  showParticipationFeeInPreview,
  setShowParticipationFeeInPreview,
  showLotteryPrizesInPreview,
  setShowLotteryPrizesInPreview
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FaEye className="text-purple-600 text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Preview Display Settings</h3>
          <p className="text-sm text-gray-600">Control what information is visible in the public preview</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Show Participation Fee Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FaDollarSign className="text-green-600" />
              <label className="font-medium text-gray-800">
                Show Participation Fee in Preview
              </label>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              Display participation fees publicly in the election preview
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowParticipationFeeInPreview(!showParticipationFeeInPreview)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              showParticipationFeeInPreview ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                showParticipationFeeInPreview ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Show Lottery Prizes Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FaGift className="text-yellow-600" />
              <label className="font-medium text-gray-800">
                Show Gamification Prizes in Preview
              </label>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              Display Gamify prize 
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLotteryPrizesInPreview(!showLotteryPrizesInPreview)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              showLotteryPrizesInPreview ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                showLotteryPrizesInPreview ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <FaExclamationTriangle className="text-blue-600 mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Privacy Control</p>
            <p>
              These settings control what voters see in the election preview. Regardless of these settings, 
              fees will still be collected when configured, and gamify information will be available to participants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// RESULTS & FEATURES COMPONENT
// ============================================
export function ResultsFeatures({ data, updateData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaEye className="text-indigo-600" />
        Results & Features
      </h3>

      <div className="space-y-4">
        {/* Show Live Results */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="font-semibold text-gray-800 flex items-center gap-2">
              {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
              Show Live Results During Election
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Display vote counts in real-time while election is active
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.show_live_results || false}
              onChange={(e) => updateData({ show_live_results: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Vote Editing */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="font-semibold text-gray-800 flex items-center gap-2">
              {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
              Allow Voters to Change Their Votes
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Voters can modify their choices before election ends
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.vote_editing_allowed || false}
              onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default {
  PreviewSettings,
  ResultsFeatures
};