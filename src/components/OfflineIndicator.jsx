// ============================================
// 🚨 OFFLINE INDICATOR COMPONENT - NEW FILE
// ============================================
// Location: src/components/OfflineIndicator.jsx
// Shows a banner when user is offline

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsOnline,
  selectShowOfflineIndicator,
  selectOfflineMessage,
  clearOfflineMessage,
} from '../redux/slices/offlineSlice';

const OfflineIndicator = () => {
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);
  /*eslint-disable*/
  const showIndicator = useSelector(selectShowOfflineIndicator);
  const offlineMessage = useSelector(selectOfflineMessage);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // ✅ Show "back online" message temporarily
    if (isOnline && offlineMessage === 'Back online!') {
      setShowBackOnline(true);
      
      const timer = setTimeout(() => {
        setShowBackOnline(false);
        dispatch(clearOfflineMessage());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineMessage, dispatch]);

  // ✅ Don't show anything if online and no message
  if (isOnline && !showBackOnline) {
    return null;
  }

  return (
    <>
      {/* OFFLINE BANNER */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Offline Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
              
              {/* Message */}
              <div>
                <p className="font-semibold">You're offline</p>
                <p className="text-sm">Showing cached data. Some features may be limited.</p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-yellow-500 px-4 py-2 rounded-md font-medium hover:bg-yellow-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* BACK ONLINE BANNER */}
      {showBackOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 shadow-lg animate-slide-down">
          <div className="container mx-auto flex items-center justify-center gap-3">
            {/* Online Icon */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            
            {/* Message */}
            <p className="font-semibold">You're back online!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;

