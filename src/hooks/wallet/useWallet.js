// src/hooks/wallet/useWallet.js
// ✨ Wallet hook
import { useDispatch, useSelector } from 'react-redux';
/*eslint-disable*/
import { 
  setWallet,
  updateBalance,
  setTransactions,
  setFilters,
  startDeposit,
  completeDeposit,
  startWithdrawal,
  completeWithdrawal,
} from '../../redux/slices/wallletSlice';
import { 
  useGetWalletQuery,
  useGetTransactionsQuery,
} from '../../redux/api/walllet/walletApi';
import { 
  useCreateDepositMutation,
} from '../../redux/api/walllet/depositApi';
import { 
  useRequestWithdrawalMutation,
} from '../../redux/api/walllet/withdrawalApi';

export const useWallet = () => {
  const dispatch = useDispatch();
  const walletState = useSelector(state => state.walllet);

  const { 
    data: walletData, 
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useGetWalletQuery();

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useGetTransactionsQuery({
    page: walletState.transactionsPagination.page,
    limit: walletState.transactionsPagination.limit,
    ...walletState.filters,
  });

  const [createDeposit, { isLoading: depositing }] = useCreateDepositMutation();
  const [requestWithdrawal, { isLoading: withdrawing }] = useRequestWithdrawalMutation();

  const handleDeposit = async (amount, paymentMethod, regionCode) => {
    try {
      const result = await createDeposit({
        amount,
        paymentMethod,
        regionCode,
      }).unwrap();

      dispatch(startDeposit({
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      }));

      return { success: true, data: result };
    } catch (error) {
      console.error('Deposit error:', error);
      return { success: false, error: error.data?.error };
    }
  };

  const handleWithdrawal = async (amount, paymentMethod, paymentDetails) => {
    try {
      const result = await requestWithdrawal({
        amount,
        paymentMethod,
        paymentDetails,
      }).unwrap();

      dispatch(startWithdrawal({
        requestId: result.requestId,
      }));

      refetchWallet();
      return { success: true, data: result };
    } catch (error) {
      console.error('Withdrawal error:', error);
      return { success: false, error: error.data?.error };
    }
  };

  return {
    ...walletState,
    walletLoading,
    transactionsLoading,
    depositing,
    withdrawing,
    refetchWallet,
    refetchTransactions,
    deposit: handleDeposit,
    withdraw: handleWithdrawal,
    setFilters: (filters) => dispatch(setFilters(filters)),
  };
};