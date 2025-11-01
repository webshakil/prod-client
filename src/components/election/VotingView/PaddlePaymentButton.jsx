import React from 'react';

export default function PaddlePaymentButton({ onClick, isLoading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400"
    >
      {isLoading ? 'Processing...' : 'Pay with Paddle'}
    </button>
  );
}