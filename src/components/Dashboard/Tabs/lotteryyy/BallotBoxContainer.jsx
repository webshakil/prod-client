// src/components/Dashboard/Tabs/lotteryyy/BallotBoxContainer.jsx
// ✨ 3D Ballot Box Container for Non-Lotterized Elections
import React, { useEffect, useRef, useState } from 'react';
import { BallotBoxScene } from '../../../../services/three/BallotBoxScene';
import { CheckCircle } from 'lucide-react';

export default function BallotBoxContainer({ 
  electionId,
  voteCount = 0,
  compact = false,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [votesAdded, setVotesAdded] = useState(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    try {
      sceneRef.current = new BallotBoxScene(containerRef.current);
      setIsInitialized(true);
      console.log('✅ 3D Ballot Box initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ballot box:', error);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, [isInitialized]);

  // Add votes gradually
  useEffect(() => {
    if (!sceneRef.current || !isInitialized || voteCount === 0) return;

    const addVotesGradually = async () => {
      for (let i = votesAdded; i < voteCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        sceneRef.current.addVote(i + 1, false);
        setVotesAdded(i + 1);
      }
    };

    addVotesGradually();
  }, [voteCount, isInitialized, votesAdded]);

  // Listen for new votes
  useEffect(() => {
    const handleVoteCast = (event) => {
      if (event.detail.electionId === electionId && sceneRef.current) {
        sceneRef.current.addVote(votesAdded + 1, true);
        setVotesAdded(prev => prev + 1);
      }
    };

    window.addEventListener('vote-cast', handleVoteCast);
    return () => window.removeEventListener('vote-cast', handleVoteCast);
  }, [electionId, votesAdded]);

  if (compact) {
    return (
      <div className="relative w-full h-full">
        <div 
          ref={containerRef} 
          className="w-full h-full rounded-lg overflow-hidden"
          style={{ minHeight: '300px' }}
        />
        
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-white text-sm font-semibold">Loading Ballot Box...</p>
            </div>
          </div>
        )}
        
        {isInitialized && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-semibold">Votes Cast</p>
            <p className="text-2xl font-bold">{votesAdded}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            🗳️ Ballot Box
          </h1>
          <p className="text-blue-200 text-lg">
            Cast your vote securely and anonymously
          </p>
        </div>

        {/* Vote Counter */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-6 text-white max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-90 mb-1">Total Votes Cast</p>
              <p className="text-5xl font-black">{votesAdded}</p>
            </div>
            <CheckCircle className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* 3D Ballot Box */}
        <div className="bg-black bg-opacity-50 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            3D Ballot Box
          </h2>
          <div className="relative">
            <div 
              ref={containerRef} 
              className="w-full rounded-lg overflow-hidden"
              style={{ height: '600px' }}
            />

            {!isInitialized && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-white text-lg font-semibold">Initializing 3D Ballot Box...</p>
                </div>
              </div>
            )}

            {isInitialized && (
              <div className="absolute bottom-16 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
                <p>🖱️ Drag to rotate • Scroll to zoom</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">📋 How It Works</h3>
          <ol className="space-y-2 text-sm">
            <li>✅ <strong>Answer the questions</strong> - Select your choices carefully</li>
            <li>🔒 <strong>Submit securely</strong> - Your vote is encrypted</li>
            <li>🗳️ <strong>Watch it drop</strong> - See your vote enter the ballot box</li>
            <li>✓ <strong>Get confirmation</strong> - Receive your vote receipt</li>
            <li>📊 <strong>View results</strong> - Check live results if enabled</li>
          </ol>
        </div>

      </div>
    </div>
  );
}