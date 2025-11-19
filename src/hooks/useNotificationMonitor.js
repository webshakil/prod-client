// src/hooks/useNotificationMonitor.js
// ✅ PRODUCTION READY - Connects to Election Service, Voting Service, and handles Wallet notifications
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../redux/slices/notificationSlice';
import { io } from 'socket.io-client';

/**
 * Hook to connect to WebSocket and receive real-time notifications
 * Connects to multiple backend services
 */
export function useNotificationMonitor() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const currentUserId = auth.userId;
  
  const electionSocketRef = useRef(null);
  const votingSocketRef = useRef(null); // ✅ NEW: Added for voting service

  useEffect(() => {
    if (!currentUserId) {
      console.log('⚠️ No userId, skipping WebSocket connection');
      return;
    }

    // ✅ EXISTING: Election Service (UNCHANGED)
    const ELECTION_SERVICE_URL = import.meta.env.VITE_ELECTION_WSOCKET_URL || 'http://localhost:3005';
    
    // ✅ NEW: Voting Service URL
    const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_WSOCKET_URL || 'http://localhost:3007';
    
    console.log('🔌 Connecting to Election Service WebSocket at:', ELECTION_SERVICE_URL);
    console.log('🔌 Connecting to Voting Service WebSocket at:', VOTING_SERVICE_URL);

    // ========================================
    // ELECTION SERVICE CONNECTION (UNCHANGED - ALREADY WORKING)
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
    // ✅ NEW: VOTING SERVICE CONNECTION
    // ========================================
    const votingSocket = io(VOTING_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    votingSocket.on('connect', () => {
      console.log('✅ Connected to Voting Service WebSocket');
      votingSocket.emit('join-notifications', currentUserId);
    });

    votingSocket.on('notification', (notification) => {
      console.log('🗳️ Received notification from Voting Service:', notification);
      dispatch(addNotification(notification));
    });

    votingSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Voting Service WebSocket');
    });

    votingSocket.on('error', (error) => {
      console.error('❌ Voting Service WebSocket error:', error);
    });

    votingSocketRef.current = votingSocket;

    // ========================================
    // CLEANUP ON UNMOUNT
    // ========================================
    return () => {
      console.log('🔌 Cleaning up WebSocket connections...');
      
      // Election Service cleanup (UNCHANGED)
      if (electionSocketRef.current) {
        electionSocketRef.current.emit('leave-notifications', currentUserId);
        electionSocketRef.current.disconnect();
      }

      // ✅ NEW: Voting Service cleanup
      if (votingSocketRef.current) {
        votingSocketRef.current.emit('leave-notifications', currentUserId);
        votingSocketRef.current.disconnect();
      }
    };
  }, [currentUserId, dispatch]);

  // Return socket instances for manual usage if needed
  return {
    electionSocket: electionSocketRef.current,
    votingSocket: votingSocketRef.current, // ✅ NEW: Return voting socket
  };
}

/**
 * Helper hook to manually trigger notifications (for local actions)
 * ✅ ENHANCED: Added payment and voting notification helpers
 */
export function useNotifications() {
  const dispatch = useDispatch();

  const notify = {
    // ===== EXISTING: Election notifications (UNCHANGED) =====
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

    // ===== ✅ NEW: Payment notifications =====
    paymentInitiated: (paymentData) => {
      dispatch(addNotification({
        type: 'payment_initiated',
        title: 'Payment Processing',
        message: `Processing payment of $${paymentData.amount} for "${paymentData.electionTitle}"...`,
        link: `/election/${paymentData.electionId}`,
        data: paymentData,
      }));
    },

    paymentSuccess: (paymentData) => {
      dispatch(addNotification({
        type: 'payment_success',
        title: '✅ Payment Successful',
        message: `Payment of $${paymentData.amount} completed! You can now vote.`,
        link: `/election/${paymentData.electionId}/vote`,
        data: paymentData,
      }));
    },

    paymentFailed: (paymentData) => {
      dispatch(addNotification({
        type: 'payment_failed',
        title: '❌ Payment Failed',
        message: `Payment of $${paymentData.amount} failed. Please try again.`,
        link: `/election/${paymentData.electionId}`,
        data: paymentData,
      }));
    },

    // ===== ✅ NEW: Vote notifications =====
    voteCast: (voteData) => {
      dispatch(addNotification({
        type: 'vote_cast',
        title: '🗳️ Vote Recorded',
        message: `Your vote in "${voteData.electionTitle}" has been recorded successfully!`,
        link: `/election/${voteData.electionId}/results`,
        data: voteData,
      }));
    },

    voteUpdated: (voteData) => {
      dispatch(addNotification({
        type: 'vote_updated',
        title: '📝 Vote Updated',
        message: `Your vote in "${voteData.electionTitle}" has been updated.`,
        link: `/election/${voteData.electionId}/results`,
        data: voteData,
      }));
    },

    // ===== ✅ NEW: Lottery notifications =====
    lotteryTicket: (lotteryData) => {
      dispatch(addNotification({
        type: 'lottery_ticket_created',
        title: '🎫 Lottery Ticket Created',
        message: `You've been entered into the lottery for "${lotteryData.electionTitle}"!`,
        link: `/election/${lotteryData.electionId}/lottery`,
        data: lotteryData,
      }));
    },

    lotteryWinner: (winnerData) => {
      dispatch(addNotification({
        type: 'lottery_winner',
        title: '🏆 Congratulations! You Won!',
        message: `You won the lottery in "${winnerData.electionTitle}"!`,
        link: '/dashboard/wallet',
        data: winnerData,
      }));
    },
  };

  return notify;
}
//last workable code just to add voting service an wallet service above code
// // src/hooks/useNotificationMonitor.js
// // ✅ PRODUCTION READY - Uses environment variables
// import { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addNotification } from '../redux/slices/notificationSlice';
// import { io } from 'socket.io-client';

// /**
//  * Hook to connect to WebSocket and receive real-time notifications
//  * Uses environment variables for production deployment
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

//     // ✅ Use environment variable or fallback to localhost
//     //const ELECTION_SERVICE_URL = import.meta.env.VITE_ELECTION_SERVICE_URL || 'http://localhost:3005/api';
//     const ELECTION_SERVICE_URL = import.meta.env.VITE_ELECTION_WSOCKET_URL || 'http://localhost:3005';
    
//     console.log('🔌 Connecting to Election Service WebSocket at:', ELECTION_SERVICE_URL);

//     // ========================================
//     // CONNECT TO ELECTION SERVICE
//     // ========================================
//     const electionSocket = io(ELECTION_SERVICE_URL, {
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
