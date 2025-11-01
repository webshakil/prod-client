import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  applicableFee,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
  votingInProgress
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <CreditCard size={20} />
              <span>Credit/Debit Card</span>
            </label>
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Wallet size={20} />
              <span>Wallet Balance</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Payment:</span>
              <span className="text-xl font-bold text-blue-900">
                {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-600 border-t pt-2">
              <p>• Processing: {applicableFee?.currency} {applicableFee?.processingFee.toFixed(2)}</p>
              <p>• Frozen: {applicableFee?.currency} {applicableFee?.frozenAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={votingInProgress}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400"
          >
            {votingInProgress ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}