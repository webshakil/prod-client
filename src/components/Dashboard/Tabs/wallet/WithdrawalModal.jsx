// src/components/Dashboard/Tabs/wallet/WithdrawalModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Mail, 
  User, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useRequestWithdrawalMutation } from '../../../../redux/api/walllet/wallletApi';

export default function WithdrawalModal({ balance, currency = 'USD', onClose }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState(null);

  const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

  const handleQuickAmount = (percentage) => {
    const calculatedAmount = (balance * percentage / 100).toFixed(2);
    setAmount(calculatedAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const withdrawalAmount = parseFloat(amount);

    // Validation
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    if (withdrawalAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!accountEmail.trim()) {
      toast.error('Please enter account email');
      return;
    }

    if (!accountName.trim()) {
      toast.error('Please enter account name');
      return;
    }

    try {
      const result = await requestWithdrawal({
        amount: withdrawalAmount,
        paymentMethod: paymentMethod,
        paymentDetails: {
          accountEmail: accountEmail.trim(),
          accountName: accountName.trim()
        }
      }).unwrap();

      console.log('✅ Withdrawal result:', result);
      
      setWithdrawalResult(result);
      setIsSuccess(true);
      
      toast.success(`🎉 $${withdrawalAmount.toFixed(2)} withdrawal processed successfully!`);

    } catch (error) {
      console.error('❌ Withdrawal error:', error);
      toast.error(error.data?.error || error.message || 'Withdrawal failed');
    }
  };

  // Success Screen - FIXED: Calculate from amount state, not API response
  if (isSuccess) {
    const withdrawnAmount = parseFloat(amount);
    const processingFee = withdrawnAmount * 0.01;
    const netReceive = withdrawnAmount - processingFee;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Successful!</h2>
            <p className="text-green-100">Your funds are on the way</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Withdrawn</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${withdrawnAmount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Processing Fee (1%)</span>
                <span className="text-red-500">-${processingFee.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">You'll Receive</span>
                <span className="text-xl font-bold text-green-600">
                  ${netReceive.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900">
                  {paymentMethod === 'stripe' ? 'Stripe (Instant)' : 
                   paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                   paymentMethod === 'paypal' ? 'PayPal' : paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account</span>
                <span className="font-medium text-gray-900">{accountEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Name</span>
                <span className="font-medium text-gray-900">{accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  COMPLETED
                </span>
              </div>
              {withdrawalResult?.transfer_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer ID</span>
                  <span className="font-mono text-xs text-gray-500">
                    {withdrawalResult.transfer_id}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-yellow-800">
                Funds typically arrive within 1-3 business days. You'll receive a confirmation email at <strong>{accountEmail}</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Balance Display */}
        <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-600 font-medium">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900">{currency} {balance.toFixed(2)}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Withdrawal Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01"
                min="10"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-3">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickAmount(pct)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    parseFloat(amount) === parseFloat((balance * pct / 100).toFixed(2))
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pct === 100 ? 'All' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="stripe">Stripe (Instant)</option>
                <option value="bank_transfer">Bank Transfer (2-3 days)</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>

          {/* Account Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>Minimum withdrawal amount: $10</li>
                  <li>Withdrawals over $5000 require admin approval</li>
                  <li>Processing time: 1-3 business days</li>
                  <li>You'll receive a confirmation email once processed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) < 10}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  Submit Request
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// // src/components/Dashboard/Tabs/wallet/WithdrawalModal.jsx
// import React, { useState } from 'react';
// import { 
//   X, 
//   DollarSign, 
//   CreditCard, 
//   Mail, 
//   User, 
//   AlertCircle,
//   CheckCircle,
//   Loader2,
//   ArrowRight,
//   Info
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useRequestWithdrawalMutation } from '../../../../redux/api/walllet/wallletApi';

// export default function WithdrawalModal({ balance, currency = 'USD', onClose }) {
//   const [amount, setAmount] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('stripe');
//   const [accountEmail, setAccountEmail] = useState('');
//   const [accountName, setAccountName] = useState('');
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [withdrawalResult, setWithdrawalResult] = useState(null);

//   const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

//   const handleQuickAmount = (percentage) => {
//     const calculatedAmount = (balance * percentage / 100).toFixed(2);
//     setAmount(calculatedAmount);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const withdrawalAmount = parseFloat(amount);

//     // Validation
//     if (!withdrawalAmount || withdrawalAmount <= 0) {
//       toast.error('Please enter a valid amount');
//       return;
//     }

//     if (withdrawalAmount < 10) {
//       toast.error('Minimum withdrawal amount is $10');
//       return;
//     }

//     if (withdrawalAmount > balance) {
//       toast.error('Insufficient balance');
//       return;
//     }

//     if (!accountEmail.trim()) {
//       toast.error('Please enter account email');
//       return;
//     }

//     if (!accountName.trim()) {
//       toast.error('Please enter account name');
//       return;
//     }

//     try {
//       const result = await requestWithdrawal({
//         amount: withdrawalAmount,
//         paymentMethod: paymentMethod,
//         paymentDetails: {
//           accountEmail: accountEmail.trim(),
//           accountName: accountName.trim()
//         }
//       }).unwrap();

//       console.log('✅ Withdrawal result:', result);
      
//       setWithdrawalResult(result);
//       setIsSuccess(true);
      
//       toast.success(`🎉 $${withdrawalAmount.toFixed(2)} withdrawal processed successfully!`);

//     } catch (error) {
//       console.error('❌ Withdrawal error:', error);
//       toast.error(error.data?.error || error.message || 'Withdrawal failed');
//     }
//   };

//   // Success Screen
//   if (isSuccess && withdrawalResult) {
//     return (
//       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
//           {/* Success Header */}
//           <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
//             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//               <CheckCircle className="text-green-500" size={48} />
//             </div>
//             <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Successful!</h2>
//             <p className="text-green-100">Your funds are on the way</p>
//           </div>

//           {/* Details */}
//           <div className="p-6 space-y-4">
//             <div className="bg-gray-50 rounded-xl p-4 space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Amount Withdrawn</span>
//                 <span className="text-2xl font-bold text-gray-900">
//                   ${parseFloat(withdrawalResult.amount || amount).toFixed(2)}
//                 </span>
//               </div>
              
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-gray-500">Processing Fee (1%)</span>
//                 <span className="text-red-500">
//                   -${(parseFloat(withdrawalResult.fee || withdrawalResult.amount * 0.01)).toFixed(2)}
//                 </span>
//               </div>
              
//               <div className="border-t pt-3 flex justify-between items-center">
//                 <span className="font-semibold text-gray-700">You'll Receive</span>
//                 <span className="text-xl font-bold text-green-600">
//                   ${(parseFloat(withdrawalResult.netAmount || withdrawalResult.amount * 0.99)).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Payment Method</span>
//                 <span className="font-medium text-gray-900">{paymentMethod === 'stripe' ? 'Stripe (Instant)' : paymentMethod}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Account</span>
//                 <span className="font-medium text-gray-900">{accountEmail}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Status</span>
//                 <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
//                   {withdrawalResult.status?.toUpperCase() || 'COMPLETED'}
//                 </span>
//               </div>
//               {withdrawalResult.transfer_id && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Transfer ID</span>
//                   <span className="font-mono text-xs text-gray-500">{withdrawalResult.transfer_id}</span>
//                 </div>
//               )}
//             </div>

//             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
//               <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
//               <p className="text-sm text-yellow-800">
//                 Funds typically arrive within 1-3 business days. You'll receive a confirmation email at <strong>{accountEmail}</strong>.
//               </p>
//             </div>

//             <button
//               onClick={onClose}
//               className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
//             >
//               Done
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main Form
//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <h2 className="text-2xl font-bold text-gray-900">Withdraw Funds</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Balance Display */}
//         <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
//           <p className="text-sm text-blue-600 font-medium">Available Balance</p>
//           <p className="text-3xl font-bold text-gray-900">{currency} {balance.toFixed(2)}</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//           {/* Amount */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Withdrawal Amount *
//             </label>
//             <div className="relative">
//               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="number"
//                 step="0.01"
//                 min="10"
//                 max={balance}
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="0.00"
//                 className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
//                 required
//               />
//             </div>
            
//             {/* Quick Amount Buttons */}
//             <div className="flex gap-2 mt-3">
//               {[25, 50, 75, 100].map((pct) => (
//                 <button
//                   key={pct}
//                   type="button"
//                   onClick={() => handleQuickAmount(pct)}
//                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
//                     parseFloat(amount) === parseFloat((balance * pct / 100).toFixed(2))
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   {pct === 100 ? 'All' : `${pct}%`}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Payment Method *
//             </label>
//             <div className="relative">
//               <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
//               >
//                 <option value="stripe">Stripe (Instant)</option>
//                 <option value="bank_transfer">Bank Transfer (2-3 days)</option>
//                 <option value="paypal">PayPal</option>
//               </select>
//             </div>
//           </div>

//           {/* Account Email */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Account Email *
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="email"
//                 value={accountEmail}
//                 onChange={(e) => setAccountEmail(e.target.value)}
//                 placeholder="your@email.com"
//                 className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Account Name */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Account Name *
//             </label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 value={accountName}
//                 onChange={(e) => setAccountName(e.target.value)}
//                 placeholder="John Doe"
//                 className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Info Box */}
//           <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
//               <div className="text-sm text-amber-800">
//                 <p className="font-semibold mb-1">Important Information:</p>
//                 <ul className="list-disc list-inside space-y-1 text-amber-700">
//                   <li>Minimum withdrawal amount: $10</li>
//                   <li>1% processing fee applies</li>
//                   <li>Withdrawals over $5000 require admin approval</li>
//                   <li>Processing time: 1-3 business days</li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading || !amount || parseFloat(amount) < 10}
//               className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="animate-spin" size={20} />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   Submit Request
//                   <ArrowRight size={20} />
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/wallet/WithdrawalModal.jsx
// import React, { useState } from 'react';
// import { X, AlertCircle, Loader } from 'lucide-react';
// import { useRequestWithdrawalMutation } from '../../../../redux/api/walllet/wallletApi';
// import { toast } from 'react-toastify';

// export default function WithdrawalModal({ balance, currency, onClose }) {
//   const [amount, setAmount] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('stripe');
//   const [paymentDetails, setPaymentDetails] = useState({
//     accountEmail: '',
//     accountName: '',
//     bankAccount: '',
//   });
//   const [errors, setErrors] = useState({});

//   const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

//   const validateForm = () => {
//     const newErrors = {};

//     if (!amount || parseFloat(amount) <= 0) {
//       newErrors.amount = 'Please enter a valid amount';
//     }

//     if (parseFloat(amount) > balance) {
//       newErrors.amount = 'Insufficient balance';
//     }

//     if (parseFloat(amount) < 10) {
//       newErrors.amount = 'Minimum withdrawal amount is $10';
//     }

//     if (!paymentDetails.accountEmail) {
//       newErrors.accountEmail = 'Email is required';
//     }

//     if (!paymentDetails.accountName) {
//       newErrors.accountName = 'Account name is required';
//     }

//     if (paymentMethod === 'bank_transfer' && !paymentDetails.bankAccount) {
//       newErrors.bankAccount = 'Bank account is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       const result = await requestWithdrawal({
//         amount: parseFloat(amount),
//         paymentMethod,
//         paymentDetails,
//       }).unwrap();

//       if (result.success) {
//         toast.success(result.message || 'Withdrawal request submitted successfully!');
//         onClose();
//       }
//     } catch (error) {
//       console.error('Withdrawal error:', error);
//       toast.error(error?.data?.error || error?.message || 'Failed to request withdrawal');
//     }
//   };

//   const setQuickAmount = (percentage) => {
//     const calculatedAmount = (balance * percentage / 100).toFixed(2);
//     setAmount(calculatedAmount);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
//           <h2 className="text-2xl font-bold text-gray-800">Withdraw Funds</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Available Balance */}
//           <div className="bg-blue-50 rounded-lg p-4">
//             <p className="text-sm text-blue-600 mb-1">Available Balance</p>
//             <p className="text-3xl font-bold text-blue-900">
//               {currency} {balance.toFixed(2)}
//             </p>
//           </div>

//           {/* Amount Input */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Withdrawal Amount  *
//             </label>
//             <div className="relative">
//               <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
//                 $
//               </span>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="10"
//                 max={balance}
//                 value={amount}
//                 onChange={(e) => {
//                   setAmount(e.target.value);
//                   if (errors.amount) {
//                     setErrors({ ...errors, amount: null });
//                   }
//                 }}
//                 className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                   errors.amount ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="0.00"
//               />
//             </div>
//             {errors.amount && (
//               <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                 <AlertCircle size={16} />
//                 {errors.amount}
//               </p>
//             )}

//             {/* Quick Amount Buttons */}
//             <div className="flex gap-2 mt-2">
//               <button
//                 type="button"
//                 onClick={() => setQuickAmount(25)}
//                 className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
//               >
//                 25%
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setQuickAmount(50)}
//                 className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
//               >
//                 50%
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setQuickAmount(75)}
//                 className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
//               >
//                 75%
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setQuickAmount(100)}
//                 className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition"
//               >
//                 All
//               </button>
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Method *
//             </label>
//             <select
//               value={paymentMethod}
//               onChange={(e) => setPaymentMethod(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="stripe">Stripe (Instant)</option>
//               <option value="bank_transfer">Bank Transfer (2-3 days)</option>
//               <option value="paypal">PayPal</option>
//             </select>
//           </div>

//           {/* Account Details */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Account Email *
//             </label>
//             <input
//               type="email"
//               value={paymentDetails.accountEmail}
//               onChange={(e) => {
//                 setPaymentDetails({ ...paymentDetails, accountEmail: e.target.value });
//                 if (errors.accountEmail) {
//                   setErrors({ ...errors, accountEmail: null });
//                 }
//               }}
//               className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                 errors.accountEmail ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="your@email.com"
//             />
//             {errors.accountEmail && (
//               <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                 <AlertCircle size={16} />
//                 {errors.accountEmail}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Account Name *
//             </label>
//             <input
//               type="text"
//               value={paymentDetails.accountName}
//               onChange={(e) => {
//                 setPaymentDetails({ ...paymentDetails, accountName: e.target.value });
//                 if (errors.accountName) {
//                   setErrors({ ...errors, accountName: null });
//                 }
//               }}
//               className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                 errors.accountName ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="John Doe"
//             />
//             {errors.accountName && (
//               <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                 <AlertCircle size={16} />
//                 {errors.accountName}
//               </p>
//             )}
//           </div>

//           {paymentMethod === 'bank_transfer' && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Bank Account Number *
//               </label>
//               <input
//                 type="text"
//                 value={paymentDetails.bankAccount}
//                 onChange={(e) => {
//                   setPaymentDetails({ ...paymentDetails, bankAccount: e.target.value });
//                   if (errors.bankAccount) {
//                     setErrors({ ...errors, bankAccount: null });
//                   }
//                 }}
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//                   errors.bankAccount ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Account Number"
//               />
//               {errors.bankAccount && (
//                 <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                   <AlertCircle size={16} />
//                   {errors.bankAccount}
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Info Box */}
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//             <div className="flex gap-3">
//               <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
//               <div className="text-sm text-yellow-800">
//                 <p className="font-semibold mb-1">Important Information:</p>
//                 <ul className="list-disc list-inside space-y-1">
//                   <li>Minimum withdrawal amount: $10</li>
//                   <li>Withdrawals over $5000 require admin approval</li>
//                   <li>Processing time: 1-3 business days</li>
//                   <li>You'll receive a confirmation email once processed</li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* Summary */}
//           {amount && parseFloat(amount) > 0 && (
//             <div className="bg-gray-50 rounded-lg p-4 space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Withdrawal Amount</span>
//                 <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Processing Fee</span>
//                 <span className="font-semibold">$0.00</span>
//               </div>
//               <div className="border-t pt-2 flex justify-between">
//                 <span className="font-bold text-gray-800">You'll Receive</span>
//                 <span className="text-xl font-bold text-green-600">
//                   ${parseFloat(amount).toFixed(2)}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Actions */}
//           <div className="flex gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isLoading}
//               className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading || !amount || parseFloat(amount) <= 0}
//               className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader className="animate-spin" size={20} />
//                   Processing...
//                 </>
//               ) : (
//                 'Submit Request'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }