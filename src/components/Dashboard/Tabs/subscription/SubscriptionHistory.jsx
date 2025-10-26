// src/components/Dashboard/Tabs/subscription/SubscriptionHistory.jsx
import React from 'react';
import { useGetUserPaymentsQuery } from '../../../../redux/api/subscription/subscriptionApi';
import { Loader, CreditCard, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function SubscriptionHistory() {
  const { data, isLoading, error } = useGetUserPaymentsQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div id="payment-history" className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (error || !data?.payments || data.payments.length === 0) {
    return (
      <div id="payment-history" className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 text-center">No payment history yet</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === 'completed' || statusLower === 'success') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircle size={12} />
          Completed
        </span>
      );
    }
    
    if (statusLower === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          <Clock size={12} />
          Pending
        </span>
      );
    }
    
    if (statusLower === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          <XCircle size={12} />
          Failed
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full capitalize">
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="payment-history" className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        <p className="text-sm text-gray-600 mt-1">View all your transactions and payment details</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gateway
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(payment.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${parseFloat(payment.amount || 0).toFixed(2)}
                  <span className="ml-1 text-xs text-gray-500">{payment.currency || 'USD'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="capitalize">{payment.gateway || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                  {payment.payment_method || 'card'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono max-w-xs truncate">
                  {payment.external_payment_id || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {data.payments.map((payment) => (
          <div key={payment.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-900 capitalize">
                  {payment.gateway || 'N/A'}
                </span>
              </div>
              {getStatusBadge(payment.status)}
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${parseFloat(payment.amount || 0).toFixed(2)}
              <span className="ml-1 text-sm text-gray-500">{payment.currency || 'USD'}</span>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">{formatDate(payment.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="text-gray-900 capitalize">{payment.payment_method || 'card'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="text-gray-500 font-mono text-xs break-all text-right max-w-[200px]">
                  {payment.external_payment_id || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with count */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing {data.payments.length} transaction{data.payments.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// import React from 'react';
// import { useGetSubscriptionHistoryQuery } from '../../../../redux/api/subscription/subscriptionApi';
// import { Loader } from 'lucide-react';

// const SubscriptionHistory = () => {
//   const { data, isLoading, error } = useGetSubscriptionHistoryQuery();

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader className="animate-spin text-blue-600" size={40} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//         <p className="text-red-800">Error loading subscription history</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-900">Subscription History</h2>

//       {data?.history && data.history.length > 0 ? (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Plan
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Start Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   End Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {data.history.map((item) => (
//                 <tr key={item.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {item.plan_name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {new Date(item.start_date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         item.status === 'active'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}
//                     >
//                       {item.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="bg-gray-100 border border-gray-300 rounded-lg p-12 text-center">
//           <p className="text-gray-700">No subscription history available.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubscriptionHistory;