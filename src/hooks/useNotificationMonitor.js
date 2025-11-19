// src/hooks/useNotificationMonitor.js
// ✅ PRODUCTION READY - Uses environment variables
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../redux/slices/notificationSlice';
import { io } from 'socket.io-client';

/**
 * Hook to connect to WebSocket and receive real-time notifications
 * Uses environment variables for production deployment
 */
export function useNotificationMonitor() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const currentUserId = auth.userId;
  
  const electionSocketRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) {
      console.log('⚠️ No userId, skipping WebSocket connection');
      return;
    }

    // ✅ Use environment variable or fallback to localhost
    const ELECTION_SERVICE_URL = import.meta.env.VITE_ELECTION_SERVICE_URL || 'http://localhost:3005';
    
    console.log('🔌 Connecting to Election Service WebSocket at:', ELECTION_SERVICE_URL);

    // ========================================
    // CONNECT TO ELECTION SERVICE
    // ========================================
    const electionSocket = io(ELECTION_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    electionSocket.on('connect', () => {
      console.log('✅ Connected to Election Service WebSocket');
      electionSocket.emit('join-notifications', currentUserId);
    });

    electionSocket.on('notification', (notification) => {
      console.log('📬 Received notification from Election Service:', notification);
      dispatch(addNotification(notification));
    });

    electionSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Election Service WebSocket');
    });

    electionSocket.on('error', (error) => {
      console.error('❌ Election Service WebSocket error:', error);
    });

    electionSocketRef.current = electionSocket;

    // ========================================
    // CLEANUP ON UNMOUNT
    // ========================================
    return () => {
      console.log('🔌 Cleaning up WebSocket connections...');
      
      if (electionSocketRef.current) {
        electionSocketRef.current.emit('leave-notifications', currentUserId);
        electionSocketRef.current.disconnect();
      }
    };
  }, [currentUserId, dispatch]);

  // Return socket instance for manual usage if needed
  return {
    electionSocket: electionSocketRef.current,
  };
}

/**
 * Helper hook to manually trigger notifications (for local actions)
 */
export function useNotifications() {
  const dispatch = useDispatch();

  const notify = {
    newUser: (userData) => {
      dispatch(addNotification({
        type: 'new_user',
        title: 'New User Registered',
        message: `${userData.username || userData.email} just joined Vottery!`,
        link: '/dashboard/user-management',
        data: userData,
      }));
    },

    newElection: (electionData) => {
      dispatch(addNotification({
        type: 'new_election',
        title: 'New Election Created',
        message: `"${electionData.election_title}" is now available.`,
        link: `/election/${electionData.election_id}`,
        data: electionData,
      }));
    },

    newVote: (voteData) => {
      dispatch(addNotification({
        type: 'new_vote',
        title: 'Vote Submitted',
        message: voteData.message || 'Your vote has been recorded successfully.',
        link: '/dashboard/vote-history',
        data: voteData,
      }));
    },

    votePayment: (paymentData) => {
      dispatch(addNotification({
        type: 'vote_payment',
        title: 'Vote Payment Confirmed',
        message: `Payment of $${paymentData.amount} received for "${paymentData.electionTitle}".`,
        link: '/dashboard/wallet',
        data: paymentData,
      }));
    },

    electionStatusChange: (electionData) => {
      dispatch(addNotification({
        type: 'election_status',
        title: 'Election Status Updated',
        message: `"${electionData.election_title}" status changed to ${electionData.status}.`,
        link: `/election/${electionData.election_id}`,
        data: electionData,
      }));
    },

    walletTransaction: (transactionData) => {
      dispatch(addNotification({
        type: 'wallet_transaction',
        title: transactionData.type === 'credit' ? 'Funds Added' : 'Payment Made',
        message: `${transactionData.type === 'credit' ? '+' : '-'}$${transactionData.amount}`,
        link: '/dashboard/wallet',
        data: transactionData,
      }));
    },

    system: (title, message, link = null) => {
      dispatch(addNotification({
        type: 'system',
        title,
        message,
        link,
      }));
    },
  };

  return notify;
}
// // src/hooks/useNotificationMonitor.js
// // ✅ TEMPORARY VERSION - Only Election Service
// import { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addNotification } from '../redux/slices/notificationSlice';
// import { io } from 'socket.io-client';

// /**
//  * Hook to connect to WebSocket and receive real-time notifications
//  * TEMPORARY: Only connecting to Election Service
//  */
// export function useNotificationMonitor() {
//   const dispatch = useDispatch();
//   const auth = useSelector((state) => state.auth);
//   const currentUserId = auth.userId;
  
//   const electionSocketRef = useRef(null);

//   useEffect(() => {
//     if (!currentUserId) {
//       console.log('⚠️ No userId, skipping WebSocket connection');
//       return;
//     }

//     console.log('🔌 Connecting to Election Service WebSocket...');

//     // ========================================
//     // CONNECT TO ELECTION SERVICE (Port 3005)
//     // ========================================
//     const electionSocket = io('http://localhost:3005', {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionAttempts: 5,
//     });

//     electionSocket.on('connect', () => {
//       console.log('✅ Connected to Election Service WebSocket');
//       electionSocket.emit('join-notifications', currentUserId);
//     });

//     electionSocket.on('notification', (notification) => {
//       console.log('📬 Received notification from Election Service:', notification);
//       dispatch(addNotification(notification));
//     });

//     electionSocket.on('disconnect', () => {
//       console.log('❌ Disconnected from Election Service WebSocket');
//     });

//     electionSocket.on('error', (error) => {
//       console.error('❌ Election Service WebSocket error:', error);
//     });

//     electionSocketRef.current = electionSocket;

//     // ========================================
//     // CLEANUP ON UNMOUNT
//     // ========================================
//     return () => {
//       console.log('🔌 Cleaning up WebSocket connections...');
      
//       if (electionSocketRef.current) {
//         electionSocketRef.current.emit('leave-notifications', currentUserId);
//         electionSocketRef.current.disconnect();
//       }
//     };
//   }, [currentUserId, dispatch]);

//   // Return socket instance for manual usage if needed
//   return {
//     electionSocket: electionSocketRef.current,
//   };
// }

// /**
//  * Helper hook to manually trigger notifications (for local actions)
//  */
// export function useNotifications() {
//   const dispatch = useDispatch();

//   const notify = {
//     newUser: (userData) => {
//       dispatch(addNotification({
//         type: 'new_user',
//         title: 'New User Registered',
//         message: `${userData.username || userData.email} just joined Vottery!`,
//         link: '/dashboard/user-management',
//         data: userData,
//       }));
//     },

//     newElection: (electionData) => {
//       dispatch(addNotification({
//         type: 'new_election',
//         title: 'New Election Created',
//         message: `"${electionData.election_title}" is now available.`,
//         link: `/election/${electionData.election_id}`,
//         data: electionData,
//       }));
//     },

//     newVote: (voteData) => {
//       dispatch(addNotification({
//         type: 'new_vote',
//         title: 'Vote Submitted',
//         message: voteData.message || 'Your vote has been recorded successfully.',
//         link: '/dashboard/vote-history',
//         data: voteData,
//       }));
//     },

//     votePayment: (paymentData) => {
//       dispatch(addNotification({
//         type: 'vote_payment',
//         title: 'Vote Payment Confirmed',
//         message: `Payment of $${paymentData.amount} received for "${paymentData.electionTitle}".`,
//         link: '/dashboard/wallet',
//         data: paymentData,
//       }));
//     },

//     electionStatusChange: (electionData) => {
//       dispatch(addNotification({
//         type: 'election_status',
//         title: 'Election Status Updated',
//         message: `"${electionData.election_title}" status changed to ${electionData.status}.`,
//         link: `/election/${electionData.election_id}`,
//         data: electionData,
//       }));
//     },

//     walletTransaction: (transactionData) => {
//       dispatch(addNotification({
//         type: 'wallet_transaction',
//         title: transactionData.type === 'credit' ? 'Funds Added' : 'Payment Made',
//         message: `${transactionData.type === 'credit' ? '+' : '-'}$${transactionData.amount}`,
//         link: '/dashboard/wallet',
//         data: transactionData,
//       }));
//     },

//     system: (title, message, link = null) => {
//       dispatch(addNotification({
//         type: 'system',
//         title,
//         message,
//         link,
//       }));
//     },
//   };

//   return notify;
// }