import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const SubscriptionStatus = ({ subscription, status }) => {
  if (!subscription && status === 'none') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900">No Active Subscription</h3>
            <p className="text-yellow-800 text-sm mt-1">
              Choose a plan to get started and unlock full features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Clock className="text-orange-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-orange-900">Subscription Expired</h3>
            <p className="text-orange-800 text-sm mt-1">
              Your subscription has expired. Renew to continue using premium features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (subscription && status === 'active') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-green-900">Active Subscription</h3>
              <p className="text-green-800 text-sm mt-1">{subscription.name}</p>
              {subscription.end_date && (
                <p className="text-green-700 text-xs mt-2">
                  Renews on {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">
            Active
          </span>
        </div>

        {/* Subscription Details */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-green-700 font-semibold">Elections</p>
            <p className="text-green-900">
              {subscription.max_elections === -1 ? 'Unlimited' : subscription.max_elections}
            </p>
          </div>
          <div>
            <p className="text-green-700 font-semibold">Voters per Election</p>
            <p className="text-green-900">
              {subscription.max_voters_per_election === -1
                ? 'Unlimited'
                : subscription.max_voters_per_election}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionStatus;