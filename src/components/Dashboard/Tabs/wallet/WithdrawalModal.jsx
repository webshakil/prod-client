import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useRequestWithdrawalMutation } from '../../../../redux/api/voting-2/votingApi';
import { toast } from 'react-toastify';

export default function WithdrawalModal({ balance, currency, onClose }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentDetails, setPaymentDetails] = useState({
    accountEmail: '',
    accountName: '',
    bankAccount: '',
  });
  const [errors, setErrors] = useState({});

  const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

  const validateForm = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (parseFloat(amount) > balance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (parseFloat(amount) < 10) {
      newErrors.amount = 'Minimum withdrawal amount is $10';
    }

    if (!paymentDetails.accountEmail) {
      newErrors.accountEmail = 'Email is required';
    }

    if (!paymentDetails.accountName) {
      newErrors.accountName = 'Account name is required';
    }

    if (paymentMethod === 'bank_transfer' && !paymentDetails.bankAccount) {
      newErrors.bankAccount = 'Bank account is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await requestWithdrawal({
        amount: parseFloat(amount),
        paymentMethod,
        paymentDetails,
      }).unwrap();

      if (result.success) {
        toast.success('Withdrawal request submitted successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error(error?.data?.message || 'Failed to request withdrawal');
    }
  };

  const setQuickAmount = (percentage) => {
    const calculatedAmount = (balance * percentage / 100).toFixed(2);
    setAmount(calculatedAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-blue-900">
              {currency} {balance.toFixed(2)}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="10"
                max={balance}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors({ ...errors, amount: null });
                  }
                }}
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.amount}
              </p>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQuickAmount(25)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(50)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(75)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(100)}
                className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition"
              >
                All
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="stripe">Stripe (Instant)</option>
              <option value="bank_transfer">Bank Transfer (2-3 days)</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {/* Account Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Email *
            </label>
            <input
              type="email"
              value={paymentDetails.accountEmail}
              onChange={(e) => {
                setPaymentDetails({ ...paymentDetails, accountEmail: e.target.value });
                if (errors.accountEmail) {
                  setErrors({ ...errors, accountEmail: null });
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.accountEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
            {errors.accountEmail && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.accountEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              value={paymentDetails.accountName}
              onChange={(e) => {
                setPaymentDetails({ ...paymentDetails, accountName: e.target.value });
                if (errors.accountName) {
                  setErrors({ ...errors, accountName: null });
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.accountName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.accountName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.accountName}
              </p>
            )}
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account Number *
              </label>
              <input
                type="text"
                value={paymentDetails.bankAccount}
                onChange={(e) => {
                  setPaymentDetails({ ...paymentDetails, bankAccount: e.target.value });
                  if (errors.bankAccount) {
                    setErrors({ ...errors, bankAccount: null });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Account Number"
              />
              {errors.bankAccount && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.bankAccount}
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Minimum withdrawal amount: $10</li>
                  <li>Withdrawals over $1000 require admin approval</li>
                  <li>Processing time: 1-3 business days</li>
                  <li>You'll receive a confirmation email once processed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Withdrawal Amount</span>
                <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold text-gray-800">You'll Receive</span>
                <span className="text-xl font-bold text-green-600">
                  ${parseFloat(amount).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}