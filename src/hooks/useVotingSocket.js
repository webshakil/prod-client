// src/hooks/useVotingSocket.js
// ✅ Real-time WebSocket Hook for Live Voting Updates
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007';

export const useVotingSocket = (electionId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveResults, setLiveResults] = useState(null);
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!electionId) return;

    console.log(`🔌 Connecting to WebSocket for election: ${electionId}`);

    // Initialize Socket.IO connection
    const socket = io(VOTING_SERVICE_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      
      // Join election room
      socket.emit('join-election', electionId);
    });

    socket.on('joined-election', (data) => {
      console.log(`📊 Joined election room: ${data.electionId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for vote cast events
    socket.on('vote-cast', (data) => {
      console.log('📡 Vote cast event received:', data);
      
      // You can trigger a refetch or show a notification
      // For now, we'll rely on live-results-update event
    });

    // Listen for live results updates
    socket.on('live-results-update', (data) => {
      console.log('📊 Live results update received:', data);
      setLiveResults(data.results);
      
      // Optional: Update Redux state
      // dispatch(updateLiveResults(data.results));
    });

    // Cleanup on unmount
    return () => {
      console.log(`👋 Leaving election room: ${electionId}`);
      socket.emit('leave-election', electionId);
      socket.disconnect();
    };
  }, [electionId, dispatch]);

  return {
    isConnected,
    liveResults,
    socket: socketRef.current,
  };
};

export default useVotingSocket;