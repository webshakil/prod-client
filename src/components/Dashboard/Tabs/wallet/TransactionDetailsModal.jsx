// src/components/Dashboard/Tabs/wallet/TransactionDetailsModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function TransactionDetailsModal({ transaction, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Transaction Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-mono text-sm">{transaction.transaction_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-semibold">{transaction.transaction_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold">${parseFloat(transaction.amount).toFixed(2)}</p>
          </div>
          {transaction.stripe_fee && (
            <div>
              <p className="text-sm text-gray-600">Stripe Fee</p>
              <p className="font-semibold text-red-600">-${parseFloat(transaction.stripe_fee).toFixed(2)}</p>
            </div>
          )}
          {transaction.platform_fee && (
            <div>
              <p className="text-sm text-gray-600">Platform Fee</p>
              <p className="font-semibold text-red-600">-${parseFloat(transaction.platform_fee).toFixed(2)}</p>
            </div>
          )}
          {transaction.net_amount && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">Net Amount</p>
              <p className="text-2xl font-bold text-green-600">${parseFloat(transaction.net_amount).toFixed(2)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              transaction.status === 'success' ? 'bg-green-100 text-green-700' :
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {transaction.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p>{new Date(transaction.created_at).toLocaleString()}</p>
          </div>
          {transaction.description && (
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p>{transaction.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}