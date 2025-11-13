// src/components/Dashboard/Tabs/wallet/DepositModal.jsx
import React, { useState } from 'react';
import { X, Loader, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreateDepositMutation } from '../../../../redux/api/walllet/depositApi';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);

function DepositForm({ onSuccess, onClose }) {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [createDeposit] = useCreateDepositMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !amount || parseFloat(amount) < 10) {
      toast.error('Please enter a valid amount (minimum $10)');
      return;
    }

    setProcessing(true);

    try {
      const result = await createDeposit({
        amount: parseFloat(amount),
        paymentMethod: 'card',
        regionCode: 'region_1_us_canada',
      }).unwrap();

      const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success(`Deposited $${result.breakdown.netAmount} (after fees)`);
        onSuccess();
      }
    } catch (err) {
      toast.error(err.data?.error || 'Deposit failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Amount (USD)</label>
        <input
          type="number"
          min="10"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
          placeholder="10.00"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <CardElement />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? <Loader className="animate-spin mx-auto" size={20} /> : 'Deposit'}
        </button>
      </div>
    </form>
  );
}

export default function DepositModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Deposit Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <DepositForm onSuccess={onClose} onClose={onClose} />
          </Elements>
        </div>
      </div>
    </div>
  );
}