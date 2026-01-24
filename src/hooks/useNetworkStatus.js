// ============================================
// 🔌 NETWORK MONITOR HOOK - NEW FILE
// ============================================
// Location: src/hooks/useNetworkStatus.js
// This hook monitors network status and updates Redux

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineStatus, selectIsOnline } from '../redux/slices/offlineSlice';

export const useNetworkStatus = () => {
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);

  useEffect(() => {
    // ✅ LISTEN FOR ONLINE EVENT
    const handleOnline = () => {
      console.log('📡 Network: ONLINE');
      dispatch(setOnlineStatus(true));
    };

    // ✅ LISTEN FOR OFFLINE EVENT
    const handleOffline = () => {
      console.log('📡 Network: OFFLINE');
      dispatch(setOnlineStatus(false));
    };

    // ✅ SET INITIAL STATUS
    dispatch(setOnlineStatus(navigator.onLine));

    // ✅ ADD EVENT LISTENERS
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // ✅ CLEANUP
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return { isOnline };
};