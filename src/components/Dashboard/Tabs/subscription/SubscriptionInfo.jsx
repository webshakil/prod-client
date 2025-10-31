import React from 'react';
import { useGetUserCurrentSubscriptionQuery } from '../../../../redux/api/subscription/subscriptionApi';
import { Loader, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SubscriptionInfo() {
  const { data, isLoading, error } = useGetUserCurrentSubscriptionQuery();


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (error || !data?.subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-gray-400" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">No Active Subscription</h3>
        </div>
        <p className="text-gray-600 mb-4">
          You don't have an active subscription yet. Choose a plan to get started!
        </p>
        <button
          onClick={() => (window.location.href = '/pricing')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View Plans
        </button>
      </div>
    );
  }

  const subscription = data.subscription;
  const isActive = subscription.status === 'active';
  const daysLeft = subscription.days_remaining || 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CreditCard size={32} />
            <div>
              <h3 className="text-xl font-bold">
                {subscription.plan_name || 'Subscription'}
              </h3>
              <p className="text-blue-100 text-sm">Current Plan</p>
            </div>
          </div>
          {isActive ? (
            <div className="flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full">
              <CheckCircle size={16} />
              <span className="text-sm font-semibold">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
              <XCircle size={16} />
              <span className="text-sm font-semibold">Expired</span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Amount */}
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="text-xl font-bold text-gray-900">
              ${parseFloat(subscription.amount || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {subscription.currency || 'USD'}
            </p>
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-600">Billing Cycle</p>
            <p className="text-xl font-bold text-gray-900 capitalize">
              {subscription.billing_cycle || 'Monthly'}
            </p>
            <p className="text-xs text-gray-500">
              {subscription.payment_type || 'Recurring'}
            </p>
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-start gap-3">
          <div
            className={`${
              isActive ? 'bg-purple-100' : 'bg-red-100'
            } p-3 rounded-lg flex-shrink-0`}
          >
            <Calendar
              className={`${isActive ? 'text-purple-600' : 'text-red-600'}`}
              size={24}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-600">
              {isActive ? 'Renews On' : 'Expired On'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatDate(subscription.end_date)}
            </p>
            <p className="text-xs text-gray-500">
              {isActive ? `${daysLeft} days left` : 'Subscription ended'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {subscription.gateway && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-600">Payment Gateway: </span>
              <span className="font-medium text-gray-900 capitalize">
                {subscription.gateway}
              </span>
            </div>
            {subscription.start_date && (
              <div>
                <span className="text-gray-600">Started: </span>
                <span className="font-medium text-gray-900">
                  {formatDate(subscription.start_date)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3 flex-wrap">
        {isActive ? (
          <>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Manage Subscription
            </button>
            <button
              onClick={() => {
                const historySection =
                  document.getElementById('payment-history');
                if (historySection) {
                  historySection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              View Payment History
            </button>
          </>
        ) : (
          <button
            onClick={() => (window.location.href = '/pricing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Renew Subscription
          </button>
        )}
      </div>
    </div>
  );
}
