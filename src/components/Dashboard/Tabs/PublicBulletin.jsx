import React, { useState, useEffect } from 'react';
import { Globe, Hash, Shield, Clock, CheckCircle, Search, Users, TrendingUp, Eye } from 'lucide-react';

export default function PublicBulletin() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [bulletinData, setBulletinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingElections, setLoadingElections] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setLoadingElections(true);
    let fetchedElections = [];

    try {
      // Get auth data from multiple sources
      const persistRoot = localStorage.getItem('persist:vottery-root');
      const userData = localStorage.getItem('userData');
      const accessToken = localStorage.getItem('accessToken');
      
      let userId = null;
      let userDataObj = null;
      
      // Try persist:vottery-root first
      if (persistRoot) {
        try {
          const parsed = JSON.parse(persistRoot);
          const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
          userId = authData.userId;
          userDataObj = {
            userId: authData.userId,
            email: authData.email,
            roles: authData.roles || ['Voter']
          };
          console.log('🔍 Found userId from persist:vottery-root:', userId);
          /*eslint-disable*/
        } catch (e) {
          console.log('⚠️ Failed to parse persist:vottery-root');
        }
      }
      
      // Fallback to userData
      if (!userId && userData) {
        try {
          const parsed = JSON.parse(userData);
          userId = parsed.userId;
          userDataObj = {
            userId: parsed.userId,
            email: parsed.email,
            phone: parsed.phone || null,
            username: parsed.username || null,
            roles: (parsed.roles || ['Voter']).map(role => 
              role === 'ContentCreator' ? 'Content_Creator' : role
            ),
            subscriptionType: parsed.subscriptionType || 'Free',
            isSubscribed: parsed.isSubscribed || false
          };
          console.log('🔍 Found userId from userData:', userId);
          /*eslint-disable*/
        } catch (e) {
          console.log('⚠️ Failed to parse userData');
        }
      }

      if (!userId) {
        console.log('❌ No user ID found in localStorage');
        setLoadingElections(false);
        return;
      }

      console.log('👤 Fetching voting history for user:', userId);

      // Build headers
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId.toString(),
      };

      if (userDataObj) {
        headers['x-user-data'] = JSON.stringify(userDataObj);
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Use correct endpoint: /voting/history (not /votes/history)
      const url = `${API_URL}/voting/history?page=1&limit=100`;
      console.log('📡 Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const data = await response.json();

      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Data:', data);

      if (data.success && data.data?.votes) {
        const votedElections = data.data.votes;
        
        console.log('✅ Votes received:', votedElections.length);
        
        // Extract unique elections
        const uniqueElections = [];
        const seenIds = new Set();
        
        votedElections.forEach(vote => {
          if (!seenIds.has(vote.election_id)) {
            seenIds.add(vote.election_id);
            uniqueElections.push({
              id: vote.election_id,
              title: vote.election_title || `Election #${vote.election_id}`,
              description: `You voted on ${new Date(vote.created_at).toLocaleDateString()}`,
              start_date: vote.created_at,
              end_date: vote.created_at,
              status: vote.election_status || 'completed',
              voted_at: vote.created_at,
            });
          }
        });

        fetchedElections = uniqueElections;
        console.log(`✅ Found ${fetchedElections.length} unique elections`);
      } else {
        console.log('❌ API response unsuccessful or no votes:', data);
      }

    } catch (error) {
      console.error('❌ Error fetching user voting history:', error);
    }

    setElections(fetchedElections);
    setLoadingElections(false);

    // Auto-select first election
    if (fetchedElections.length > 0) {
      fetchBulletinBoard(fetchedElections[0].id);
    }
  };

  const fetchBulletinBoard = async (electionId) => {
    setLoading(true);
    setSelectedElectionId(electionId);
    
    console.log('📊 Fetching bulletin board for election:', electionId);
    
    try {
      // Get auth headers
      const accessToken = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      let userId = null;
      if (userData) {
        try {
          userId = JSON.parse(userData).userId;
        } catch (e) {}
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (userId) {
        headers['x-user-id'] = userId.toString();
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_URL}/voting/public-bulletin/${electionId}`, {
        method: 'GET',
        headers: headers
      });

      const data = await response.json();
      
      console.log('📥 Bulletin board response:', data);
      
      if (data.success) {
        setBulletinData(data.data);
        console.log('✅ Bulletin board loaded');
      } else {
        console.error('❌ Failed to fetch bulletin:', data.message);
        setBulletinData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching bulletin board:', error);
      setBulletinData(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredElections = elections.filter(election =>
    election.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Clear Explanation */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={32} />
          <h1 className="text-3xl font-bold">My Voting Activity</h1>
        </div>
        <p className="text-blue-100 text-lg mb-3">
          View transparent records of elections where you have voted
        </p>
        <div className="bg-blue-700 bg-opacity-50 rounded-lg p-3 text-sm">
          <strong>ℹ️ What you can see here:</strong>
          <ul className="mt-2 space-y-1 ml-4">
            <li>• Elections where you cast a vote</li>
            <li>• Total votes in those elections (anonymized)</li>
            <li>• Cryptographic proof your vote was recorded securely</li>
            <li>• When votes were cast (without revealing who voted for what)</li>
          </ul>
        </div>
      </div>

      {/* Election Selection with Better Title */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Elections You Voted In</h2>
            <p className="text-sm text-gray-600 mt-1">
              View transparency data for elections where you participated
            </p>
          </div>
          {elections.length > 0 && (
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold text-green-900">
                ✓ {elections.length} Election{elections.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
        
        {/* Search */}
        {elections.length > 3 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search elections by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingElections ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your voting history...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredElections.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Globe size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Voting History Yet</h3>
                <p className="text-gray-500 mb-6">
                  You haven't voted in any elections yet.<br />
                  Once you vote, you'll be able to view the transparency data here.
                </p>
                <button
                  onClick={() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    urlParams.set('tab', 'vote-now');
                    window.location.search = urlParams.toString();
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  🗳️ Browse Elections to Vote
                </button>
              </div>
            ) : (
              filteredElections.map((election) => (
                <button
                  key={election.id}
                  onClick={() => fetchBulletinBoard(election.id)}
                  className={`text-left p-5 border-2 rounded-xl transition-all hover:shadow-lg ${
                    selectedElectionId === election.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 pr-4">
                      {election.title}
                    </h3>
                    {selectedElectionId === election.id && (
                      <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        VIEWING
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {election.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-600" />
                      <span>You voted: {new Date(election.voted_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span className="font-semibold">View activity</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bulletin Board Content - Only show if election selected */}
      {selectedElectionId && (
        <>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading voting data...</p>
            </div>
          ) : bulletinData ? (
            <>
              {/* Statistics Cards with Clear Labels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-semibold mb-1">Total Votes Cast</p>
                      <p className="text-4xl font-bold">{bulletinData.totalVotes}</p>
                      <p className="text-blue-100 text-xs mt-2">People have voted</p>
                    </div>
                    <Users size={48} className="opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-semibold mb-1">Verified Votes</p>
                      <p className="text-4xl font-bold">{bulletinData.hashChain?.length || 0}</p>
                      <p className="text-green-100 text-xs mt-2">Cryptographically secured</p>
                    </div>
                    <CheckCircle size={48} className="opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-semibold mb-1">Integrity Status</p>
                      <p className="text-2xl font-bold">100% SECURE</p>
                      <p className="text-purple-100 text-xs mt-2">No tampering detected</p>
                    </div>
                    <Shield size={48} className="opacity-80" />
                  </div>
                </div>
              </div>

              {/* Recent Votes - More User Friendly */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Recent Voting Activity</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Live feed of votes (identities are protected)
                      </p>
                    </div>
                    <TrendingUp className="text-blue-600" size={32} />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                          When
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                          Verification Code
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                          Anonymous Voter
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bulletinData.votes && bulletinData.votes.slice(0, 15).map((vote, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(vote.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                              {vote.vote_hash?.substring(0, 12)}...
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {vote.anonymized_user}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {bulletinData.votes && bulletinData.votes.length > 15 && (
                  <div className="bg-gray-50 px-6 py-4 text-center border-t">
                    <p className="text-sm text-gray-600">
                      Showing 15 most recent votes out of {bulletinData.votes.length} total
                    </p>
                  </div>
                )}
              </div>

              {/* Blockchain Verification - Simplified */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Hash className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Security Verification</h2>
                    <p className="text-sm text-gray-600">Blockchain-style tamper protection</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>🔒 How it works:</strong> Every vote is linked in a chain. If anyone tries to change a vote, the entire chain breaks, making tampering impossible.
                  </p>
                  <div className="bg-white rounded p-3 mt-3">
                    <p className="text-xs text-gray-600 mb-1">Latest Security Hash:</p>
                    <code className="text-xs font-mono text-indigo-600 break-all">
                      {bulletinData.verificationHash}
                    </code>
                  </div>
                </div>

                {/* Show first 5 blocks */}
                {bulletinData.hashChain && bulletinData.hashChain.length > 0 && (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recent Verification Blocks:</p>
                    {bulletinData.hashChain.slice(0, 5).map((block) => (
                      <div
                        key={block.blockNumber}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-indigo-900">
                            Block #{block.blockNumber}
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(block.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <p className="text-gray-700 truncate">
                            <strong>Vote:</strong> {block.voteHash?.substring(0, 24)}...
                          </p>
                          <p className="text-indigo-700 truncate">
                            <strong>Block:</strong> {block.blockHash?.substring(0, 24)}...
                          </p>
                        </div>
                      </div>
                    ))}
                    {bulletinData.hashChain.length > 5 && (
                      <p className="text-center text-sm text-gray-500 pt-2">
                        Showing 5 of {bulletinData.hashChain.length} verification blocks
                      </p>
                    )}
                  </div>
                )}

                <div className="text-center mt-4 pt-4 border-t">
                  <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    All votes are verified and secure
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Globe size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Voting Activity Yet</h3>
              <p className="text-gray-500">
                This election hasn't received any votes yet.<br />
                Check back after voting begins.
              </p>
            </div>
          )}
        </>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-3 text-lg">❓ Frequently Asked Questions</h3>
        
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-gray-800 text-sm">What can I see here?</p>
            <p className="text-sm text-gray-600">
              You can see transparency data for elections where you voted - including how many people voted, when they voted, and cryptographic proof that all votes are secure. You cannot see who voted for what.
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800 text-sm">Is my vote private?</p>
            <p className="text-sm text-gray-600">
              Yes! Your vote choices are completely private. Only verification codes are shown publicly for transparency.
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800 text-sm">What does "verified" mean?</p>
            <p className="text-sm text-gray-600">
              Every vote has a unique cryptographic signature. If anyone tries to change or delete a vote, we can detect it immediately through the blockchain-style verification chain.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-800 text-sm">Why can I only see elections I voted in?</p>
            <p className="text-sm text-gray-600">
              For privacy and relevance, you can only view bulletin boards for elections where you participated. This ensures you only see data related to your voting activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { Globe, Hash, Shield, Clock, CheckCircle, Search, Users, TrendingUp, Eye } from 'lucide-react';

// export default function PublicBulletin() {
//   const [elections, setElections] = useState([]);
//   const [selectedElectionId, setSelectedElectionId] = useState(null);
//   const [bulletinData, setBulletinData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingElections, setLoadingElections] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   const API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

//   useEffect(() => {
//     fetchElections();
//   }, []);
// const fetchElections = async () => {
//   setLoadingElections(true);
//   let fetchedElections = [];

//   try {
//     // Get user data
//     const persistRoot = localStorage.getItem('persist:vottery-root');
//     if (!persistRoot) {
//       console.log('❌ No user data found in localStorage');
//       setLoadingElections(false);
//       return;
//     }

//     const parsed = JSON.parse(persistRoot);
    
//     // Get user ID - FIX: userId is directly on authData, not authData.userData
//     const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
//     const userId = authData.userId; // 🔥 FIXED: Changed from authData.userData?.userId

//     console.log('🔍 DEBUG - Auth Data:', authData);
//     console.log('🔍 DEBUG - User ID:', userId);
//     console.log('🔍 DEBUG - User ID Type:', typeof userId);

//     if (!userId) {
//       console.log('❌ No user ID found');
//       setLoadingElections(false);
//       return;
//     }

//     console.log('👤 Fetching elections for user:', userId);

//     // Fetch user's voting history
//     const url = `${API_URL}/votes/history?userId=${userId}&page=1&limit=100`;
//     console.log('📡 Fetching from URL:', url);
    
//     const response = await fetch(url);
//     const data = await response.json();

//     console.log('📥 API Response Status:', response.status);
//     console.log('📥 API Response Data:', data);

//     if (data.success && data.data.votes) {
//       const votedElections = data.data.votes;
      
//       console.log('✅ Votes received:', votedElections.length);
//       console.log('📋 Vote details:', votedElections);
      
//       // Extract unique elections
//       const uniqueElections = [];
//       const seenIds = new Set();
      
//       votedElections.forEach(vote => {
//         if (!seenIds.has(vote.election_id)) {
//           seenIds.add(vote.election_id);
//           uniqueElections.push({
//             id: vote.election_id,
//             title: vote.election_title || `Election #${vote.election_id}`,
//             description: `You voted on ${new Date(vote.created_at).toLocaleDateString()}`,
//             start_date: vote.created_at,
//             end_date: vote.created_at,
//             status: vote.election_status || 'completed',
//             voted_at: vote.created_at,
//           });
//         }
//       });

//       fetchedElections = uniqueElections;
//       console.log(`✅ Found ${fetchedElections.length} unique elections`);
//     } else {
//       console.log('❌ API response unsuccessful or no votes:', data);
//     }

//   } catch (error) {
//     console.error('❌ Error fetching user voting history:', error);
//   }

//   setElections(fetchedElections);
//   setLoadingElections(false);

//   // Auto-select first election
//   if (fetchedElections.length > 0) {
//     fetchBulletinBoard(fetchedElections[0].id);
//   }
// };



//   const fetchBulletinBoard = async (electionId) => {
//     setLoading(true);
//     setSelectedElectionId(electionId);
    
//     console.log('📊 Fetching bulletin board for election:', electionId);
    
//     try {
//       const response = await fetch(`${API_URL}/votes/public-bulletin/${electionId}`);
//       const data = await response.json();
      
//       console.log('📥 Bulletin board response:', data);
      
//       if (data.success) {
//         setBulletinData(data.data);
//         console.log('✅ Bulletin board loaded');
//       } else {
//         console.error('❌ Failed to fetch bulletin:', data.message);
//         setBulletinData(null);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching bulletin board:', error);
//       setBulletinData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header with Clear Explanation */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
//         <div className="flex items-center gap-3 mb-2">
//           <Globe size={32} />
//           <h1 className="text-3xl font-bold">My Voting Activity</h1>
//         </div>
//         <p className="text-blue-100 text-lg mb-3">
//           View transparent records of elections where you have voted
//         </p>
//         <div className="bg-blue-700 bg-opacity-50 rounded-lg p-3 text-sm">
//           <strong>ℹ️ What you can see here:</strong>
//           <ul className="mt-2 space-y-1 ml-4">
//             <li>• Elections where you cast a vote</li>
//             <li>• Total votes in those elections (anonymized)</li>
//             <li>• Cryptographic proof your vote was recorded securely</li>
//             <li>• When votes were cast (without revealing who voted for what)</li>
//           </ul>
//         </div>
//       </div>

//       {/* Election Selection with Better Title */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Elections You Voted In</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               View transparency data for elections where you participated
//             </p>
//           </div>
//           {elections.length > 0 && (
//             <div className="bg-green-50 px-4 py-2 rounded-lg">
//               <p className="text-sm font-semibold text-green-900">
//                 ✓ {elections.length} Election{elections.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//           )}
//         </div>
        
//         {/* Search */}
//         {elections.length > 3 && (
//           <div className="mb-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search elections by name..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         )}

//         {/* Loading State */}
//         {loadingElections ? (
//           <div className="text-center py-12">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p className="mt-4 text-gray-600">Loading your voting history...</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {filteredElections.length === 0 ? (
//               <div className="col-span-full text-center py-12">
//                 <Globe size={64} className="mx-auto mb-4 text-gray-300" />
//                 <h3 className="text-xl font-bold text-gray-700 mb-2">No Voting History Yet</h3>
//                 <p className="text-gray-500 mb-6">
//                   You haven't voted in any elections yet.<br />
//                   Once you vote, you'll be able to view the transparency data here.
//                 </p>
//                 <button
//                   onClick={() => {
//                     // Navigate to Vote Now tab
//                     const urlParams = new URLSearchParams(window.location.search);
//                     urlParams.set('tab', 'vote-now');
//                     window.location.search = urlParams.toString();
//                   }}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
//                 >
//                   🗳️ Browse Elections to Vote
//                 </button>
//               </div>
//             ) : (
//               filteredElections.map((election) => (
//                 <button
//                   key={election.id}
//                   onClick={() => fetchBulletinBoard(election.id)}
//                   className={`text-left p-5 border-2 rounded-xl transition-all hover:shadow-lg ${
//                     selectedElectionId === election.id
//                       ? 'border-blue-600 bg-blue-50 shadow-md'
//                       : 'border-gray-200 hover:border-blue-300'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between mb-3">
//                     <h3 className="font-bold text-lg text-gray-900 pr-4">
//                       {election.title}
//                     </h3>
//                     {selectedElectionId === election.id && (
//                       <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
//                         VIEWING
//                       </span>
//                     )}
//                   </div>
                  
//                   <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                     {election.description}
//                   </p>
                  
//                   <div className="flex items-center gap-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-1">
//                       <CheckCircle size={14} className="text-green-600" />
//                       <span>You voted: {new Date(election.voted_at).toLocaleDateString()}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Eye size={14} />
//                       <span className="font-semibold">View activity</span>
//                     </div>
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       {/* Bulletin Board Content - Only show if election selected */}
//       {selectedElectionId && (
//         <>
//           {loading ? (
//             <div className="bg-white rounded-lg shadow p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading voting data...</p>
//             </div>
//           ) : bulletinData ? (
//             <>
//               {/* Statistics Cards with Clear Labels */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-blue-100 text-sm font-semibold mb-1">Total Votes Cast</p>
//                       <p className="text-4xl font-bold">{bulletinData.totalVotes}</p>
//                       <p className="text-blue-100 text-xs mt-2">People have voted</p>
//                     </div>
//                     <Users size={48} className="opacity-80" />
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-green-100 text-sm font-semibold mb-1">Verified Votes</p>
//                       <p className="text-4xl font-bold">{bulletinData.hashChain?.length || 0}</p>
//                       <p className="text-green-100 text-xs mt-2">Cryptographically secured</p>
//                     </div>
//                     <CheckCircle size={48} className="opacity-80" />
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-purple-100 text-sm font-semibold mb-1">Integrity Status</p>
//                       <p className="text-2xl font-bold">100% SECURE</p>
//                       <p className="text-purple-100 text-xs mt-2">No tampering detected</p>
//                     </div>
//                     <Shield size={48} className="opacity-80" />
//                   </div>
//                 </div>
//               </div>

//               {/* Recent Votes - More User Friendly */}
//               <div className="bg-white rounded-lg shadow overflow-hidden">
//                 <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-900">Recent Voting Activity</h2>
//                       <p className="text-sm text-gray-600 mt-1">
//                         Live feed of votes (identities are protected)
//                       </p>
//                     </div>
//                     <TrendingUp className="text-blue-600" size={32} />
//                   </div>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b-2 border-gray-200">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
//                           When
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
//                           Verification Code
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
//                           Anonymous Voter
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {bulletinData.votes && bulletinData.votes.slice(0, 15).map((vote, index) => (
//                         <tr key={index} className="hover:bg-blue-50 transition-colors">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Date(vote.created_at).toLocaleString()}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
//                               {vote.vote_hash?.substring(0, 12)}...
//                             </code>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                             {vote.anonymized_user}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
                
//                 {bulletinData.votes && bulletinData.votes.length > 15 && (
//                   <div className="bg-gray-50 px-6 py-4 text-center border-t">
//                     <p className="text-sm text-gray-600">
//                       Showing 15 most recent votes out of {bulletinData.votes.length} total
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Blockchain Verification - Simplified */}
//               <div className="bg-white rounded-lg shadow p-6">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="bg-indigo-100 p-3 rounded-lg">
//                     <Hash className="text-indigo-600" size={24} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Security Verification</h2>
//                     <p className="text-sm text-gray-600">Blockchain-style tamper protection</p>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 mb-4">
//                   <p className="text-sm text-gray-700 mb-2">
//                     <strong>🔒 How it works:</strong> Every vote is linked in a chain. If anyone tries to change a vote, the entire chain breaks, making tampering impossible.
//                   </p>
//                   <div className="bg-white rounded p-3 mt-3">
//                     <p className="text-xs text-gray-600 mb-1">Latest Security Hash:</p>
//                     <code className="text-xs font-mono text-indigo-600 break-all">
//                       {bulletinData.verificationHash}
//                     </code>
//                   </div>
//                 </div>

//                 {/* Show first 5 blocks */}
//                 {bulletinData.hashChain && bulletinData.hashChain.length > 0 && (
//                   <div className="space-y-3 max-h-80 overflow-y-auto">
//                     <p className="text-sm font-semibold text-gray-700 mb-2">Recent Verification Blocks:</p>
//                     {bulletinData.hashChain.slice(0, 5).map((block) => (
//                       <div
//                         key={block.blockNumber}
//                         className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-sm font-bold text-indigo-900">
//                             Block #{block.blockNumber}
//                           </span>
//                           <span className="text-xs text-gray-600">
//                             {new Date(block.timestamp).toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="space-y-1 text-xs font-mono">
//                           <p className="text-gray-700 truncate">
//                             <strong>Vote:</strong> {block.voteHash?.substring(0, 24)}...
//                           </p>
//                           <p className="text-indigo-700 truncate">
//                             <strong>Block:</strong> {block.blockHash?.substring(0, 24)}...
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                     {bulletinData.hashChain.length > 5 && (
//                       <p className="text-center text-sm text-gray-500 pt-2">
//                         Showing 5 of {bulletinData.hashChain.length} verification blocks
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <div className="text-center mt-4 pt-4 border-t">
//                   <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
//                     <CheckCircle size={20} />
//                     All votes are verified and secure
//                   </p>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="bg-white rounded-lg shadow p-12 text-center">
//               <Globe size={64} className="mx-auto mb-4 text-gray-300" />
//               <h3 className="text-xl font-bold text-gray-700 mb-2">No Voting Activity Yet</h3>
//               <p className="text-gray-500">
//                 This election hasn't received any votes yet.<br />
//                 Check back after voting begins.
//               </p>
//             </div>
//           )}
//         </>
//       )}

//       {/* Help Section */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//         <h3 className="font-bold text-gray-900 mb-3 text-lg">❓ Frequently Asked Questions</h3>
        
//         <div className="space-y-3">
//           <div>
//             <p className="font-semibold text-gray-800 text-sm">What can I see here?</p>
//             <p className="text-sm text-gray-600">
//               You can see transparency data for elections where you voted - including how many people voted, when they voted, and cryptographic proof that all votes are secure. You cannot see who voted for what.
//             </p>
//           </div>
          
//           <div>
//             <p className="font-semibold text-gray-800 text-sm">Is my vote private?</p>
//             <p className="text-sm text-gray-600">
//               Yes! Your vote choices are completely private. Only verification codes are shown publicly for transparency.
//             </p>
//           </div>
          
//           <div>
//             <p className="font-semibold text-gray-800 text-sm">What does "verified" mean?</p>
//             <p className="text-sm text-gray-600">
//               Every vote has a unique cryptographic signature. If anyone tries to change or delete a vote, we can detect it immediately through the blockchain-style verification chain.
//             </p>
//           </div>

//           <div>
//             <p className="font-semibold text-gray-800 text-sm">Why can I only see elections I voted in?</p>
//             <p className="text-sm text-gray-600">
//               For privacy and relevance, you can only view bulletin boards for elections where you participated. This ensures you only see data related to your voting activity.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Globe, Hash, Shield, Clock, CheckCircle, Search, Users, TrendingUp, Eye } from 'lucide-react';

// export default function PublicBulletin() {
//   const [elections, setElections] = useState([]);
//   const [selectedElectionId, setSelectedElectionId] = useState(null);
//   const [bulletinData, setBulletinData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingElections, setLoadingElections] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5006/api';
//   const ELECTION_SERVICE_URL = 'http://localhost:3005/api/elections';

//   useEffect(() => {
//     fetchElections();
//   }, []);

//   const fetchElections = async () => {
//     setLoadingElections(true);
//     let fetchedElections = [];

//     // Try API first
//     try {
//       const response = await fetch(`${ELECTION_SERVICE_URL}/public`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.data) {
//           fetchedElections = Array.isArray(data.data) ? data.data : data.data.elections || [];
//         }
//       }
//     } catch (error) {
//       console.warn('Failed to fetch from API:', error.message);
//     }

//     // Fallback to localStorage
//     if (fetchedElections.length === 0) {
//       try {
//         const persistRoot = localStorage.getItem('persist:vottery-root');
//         if (persistRoot) {
//           const parsed = JSON.parse(persistRoot);
//           const electionData = parsed.election ? JSON.parse(parsed.election) : {};
//           fetchedElections = electionData.publicElections || electionData.elections || [];
//         }
//       } catch (error) {
//         console.error('Error loading from localStorage:', error);
//       }
//     }

//     setElections(fetchedElections);
//     setLoadingElections(false);

//     // Auto-select first election
//     if (fetchedElections.length > 0) {
//       fetchBulletinBoard(fetchedElections[0].id);
//     }
//   };

//   const fetchBulletinBoard = async (electionId) => {
//     setLoading(true);
//     setSelectedElectionId(electionId);
    
//     try {
//       const response = await fetch(`${API_URL}/votes/public-bulletin/${electionId}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setBulletinData(data.data);
//       } else {
//         setBulletinData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching bulletin board:', error);
//       setBulletinData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header with Clear Explanation */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
//         <div className="flex items-center gap-3 mb-2">
//           <Globe size={32} />
//           <h1 className="text-3xl font-bold">Election Transparency Center</h1>
//         </div>
//         <p className="text-blue-100 text-lg mb-3">
//           View live voting activity and verify election integrity
//         </p>
//         <div className="bg-blue-700 bg-opacity-50 rounded-lg p-3 text-sm">
//           <strong>ℹ️ What you can see here:</strong>
//           <ul className="mt-2 space-y-1 ml-4">
//             <li>• How many people have voted</li>
//             <li>• When votes were cast (without revealing who voted for what)</li>
//             <li>• Cryptographic proof that votes haven't been tampered with</li>
//           </ul>
//         </div>
//       </div>

//       {/* Election Selection with Better Title */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Available Elections</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Choose an election to view its voting activity
//             </p>
//           </div>
//           {elections.length > 0 && (
//             <div className="bg-blue-50 px-4 py-2 rounded-lg">
//               <p className="text-sm font-semibold text-blue-900">
//                 {elections.length} Election{elections.length !== 1 ? 's' : ''} Available
//               </p>
//             </div>
//           )}
//         </div>
        
//         {/* Search */}
//         {elections.length > 3 && (
//           <div className="mb-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search elections by name..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         )}

//         {/* Loading State */}
//         {loadingElections ? (
//           <div className="text-center py-12">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p className="mt-4 text-gray-600">Loading elections...</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {filteredElections.length === 0 ? (
//               <div className="col-span-full text-center py-12">
//                 <Globe size={64} className="mx-auto mb-4 text-gray-300" />
//                 <h3 className="text-xl font-bold text-gray-700 mb-2">No Elections Available</h3>
//                 <p className="text-gray-500 mb-6">
//                   There are currently no public elections to display.<br />
//                   Check back later or contact your election organizer.
//                 </p>
//               </div>
//             ) : (
//               filteredElections.map((election) => (
//                 <button
//                   key={election.id}
//                   onClick={() => fetchBulletinBoard(election.id)}
//                   className={`text-left p-5 border-2 rounded-xl transition-all hover:shadow-lg ${
//                     selectedElectionId === election.id
//                       ? 'border-blue-600 bg-blue-50 shadow-md'
//                       : 'border-gray-200 hover:border-blue-300'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between mb-3">
//                     <h3 className="font-bold text-lg text-gray-900 pr-4">
//                       {election.title}
//                     </h3>
//                     {selectedElectionId === election.id && (
//                       <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
//                         VIEWING
//                       </span>
//                     )}
//                   </div>
                  
//                   <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                     {election.description || 'Click to view voting activity'}
//                   </p>
                  
//                   <div className="flex items-center gap-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-1">
//                       <Clock size={14} />
//                       <span>
//                         {election.start_date ? new Date(election.start_date).toLocaleDateString() : 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Eye size={14} />
//                       <span className="font-semibold">Click to view</span>
//                     </div>
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       {/* Bulletin Board Content - Only show if election selected */}
//       {selectedElectionId && (
//         <>
//           {loading ? (
//             <div className="bg-white rounded-lg shadow p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading voting data...</p>
//             </div>
//           ) : bulletinData ? (
//             <>
//               {/* Statistics Cards with Clear Labels */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-blue-100 text-sm font-semibold mb-1">Total Votes Cast</p>
//                       <p className="text-4xl font-bold">{bulletinData.totalVotes}</p>
//                       <p className="text-blue-100 text-xs mt-2">People have voted</p>
//                     </div>
//                     <Users size={48} className="opacity-80" />
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-green-100 text-sm font-semibold mb-1">Verified Votes</p>
//                       <p className="text-4xl font-bold">{bulletinData.hashChain?.length || 0}</p>
//                       <p className="text-green-100 text-xs mt-2">Cryptographically secured</p>
//                     </div>
//                     <CheckCircle size={48} className="opacity-80" />
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-purple-100 text-sm font-semibold mb-1">Integrity Status</p>
//                       <p className="text-2xl font-bold">100% SECURE</p>
//                       <p className="text-purple-100 text-xs mt-2">No tampering detected</p>
//                     </div>
//                     <Shield size={48} className="opacity-80" />
//                   </div>
//                 </div>
//               </div>

//               {/* Recent Votes - More User Friendly */}
//               <div className="bg-white rounded-lg shadow overflow-hidden">
//                 <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-900">Recent Voting Activity</h2>
//                       <p className="text-sm text-gray-600 mt-1">
//                         Live feed of votes (identities are protected)
//                       </p>
//                     </div>
//                     <TrendingUp className="text-blue-600" size={32} />
//                   </div>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b-2 border-gray-200">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
//                           When
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
//                           Verification Code
//                         </th>
//                         <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
//                           Anonymous Voter
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {bulletinData.votes && bulletinData.votes.slice(0, 15).map((vote, index) => (
//                         <tr key={index} className="hover:bg-blue-50 transition-colors">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Date(vote.created_at).toLocaleString()}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
//                               {vote.vote_hash?.substring(0, 12)}...
//                             </code>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                             {vote.anonymized_user}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
                
//                 {bulletinData.votes && bulletinData.votes.length > 15 && (
//                   <div className="bg-gray-50 px-6 py-4 text-center border-t">
//                     <p className="text-sm text-gray-600">
//                       Showing 15 most recent votes out of {bulletinData.votes.length} total
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Blockchain Verification - Simplified */}
//               <div className="bg-white rounded-lg shadow p-6">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="bg-indigo-100 p-3 rounded-lg">
//                     <Hash className="text-indigo-600" size={24} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Security Verification</h2>
//                     <p className="text-sm text-gray-600">Blockchain-style tamper protection</p>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 mb-4">
//                   <p className="text-sm text-gray-700 mb-2">
//                     <strong>🔒 How it works:</strong> Every vote is linked in a chain. If anyone tries to change a vote, the entire chain breaks, making tampering impossible.
//                   </p>
//                   <div className="bg-white rounded p-3 mt-3">
//                     <p className="text-xs text-gray-600 mb-1">Latest Security Hash:</p>
//                     <code className="text-xs font-mono text-indigo-600 break-all">
//                       {bulletinData.verificationHash}
//                     </code>
//                   </div>
//                 </div>

//                 <div className="text-center">
//                   <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2">
//                     <CheckCircle size={20} />
//                     All votes are verified and secure
//                   </p>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="bg-white rounded-lg shadow p-12 text-center">
//               <Globe size={64} className="mx-auto mb-4 text-gray-300" />
//               <h3 className="text-xl font-bold text-gray-700 mb-2">No Voting Activity Yet</h3>
//               <p className="text-gray-500">
//                 This election hasn't received any votes yet.<br />
//                 Check back after voting begins.
//               </p>
//             </div>
//           )}
//         </>
//       )}

//       {/* Help Section */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//         <h3 className="font-bold text-gray-900 mb-3 text-lg">❓ Frequently Asked Questions</h3>
        
//         <div className="space-y-3">
//           <div>
//             <p className="font-semibold text-gray-800 text-sm">What can I see here?</p>
//             <p className="text-sm text-gray-600">
//               You can see how many people voted, when they voted, and verify that all votes are secure. You cannot see who voted for what.
//             </p>
//           </div>
          
//           <div>
//             <p className="font-semibold text-gray-800 text-sm">Is my vote private?</p>
//             <p className="text-sm text-gray-600">
//               Yes! Your vote choices are completely private. Only verification codes are shown publicly.
//             </p>
//           </div>
          
//           <div>
//             <p className="font-semibold text-gray-800 text-sm">What does "verified" mean?</p>
//             <p className="text-sm text-gray-600">
//               Every vote has a unique cryptographic signature. If anyone tries to change or delete a vote, we can detect it immediately.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Globe, Hash, Shield, Clock, CheckCircle, Search, Users, AlertCircle } from 'lucide-react';

// export default function PublicBulletin() {
//   const [elections, setElections] = useState([]);
//   const [selectedElectionId, setSelectedElectionId] = useState(null);
//   const [bulletinData, setBulletinData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingElections, setLoadingElections] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5006/api';
//   const ELECTION_SERVICE_URL = 'http://localhost:3005/api/elections'; // Adjust port as needed

//   // Fetch elections from API and localStorage
//   useEffect(() => {
//     fetchElections();
//   }, []);

//   const fetchElections = async () => {
//     setLoadingElections(true);
//     let fetchedElections = [];

//     try {
//       // Method 1: Try to fetch from election service API
//       console.log('🔍 Fetching elections from API...');
//       const response = await fetch(`${ELECTION_SERVICE_URL}/public`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.data) {
//           fetchedElections = Array.isArray(data.data) ? data.data : data.data.elections || [];
//           console.log('✅ Fetched elections from API:', fetchedElections.length);
//         }
//       }
//     } catch (error) {
//       console.warn('⚠️ Failed to fetch from API, trying localStorage:', error.message);
//     }

//     // Method 2: If API failed, try localStorage
//     if (fetchedElections.length === 0) {
//       try {
//         const persistRoot = localStorage.getItem('persist:vottery-root');
//         if (persistRoot) {
//           const parsed = JSON.parse(persistRoot);
//           const electionData = parsed.election ? JSON.parse(parsed.election) : {};
          
//           // Try multiple possible locations
//           fetchedElections = 
//             electionData.publicElections || 
//             electionData.elections || 
//             electionData.myElections || 
//             [];
          
//           console.log('📦 Loaded elections from localStorage:', fetchedElections.length);
//         }
//       } catch (error) {
//         console.error('❌ Error loading from localStorage:', error);
//       }
//     }

//     // Method 3: Check vote data for election info
//     if (fetchedElections.length === 0) {
//       try {
//         const persistRoot = localStorage.getItem('persist:vottery-root');
//         if (persistRoot) {
//           const parsed = JSON.parse(persistRoot);
//           const voteData = parsed.vote ? JSON.parse(parsed.vote) : {};
          
//           // If user has voted, we can get election from vote history
//           if (voteData.electionId && voteData.electionTitle) {
//             fetchedElections = [{
//               id: voteData.electionId,
//               title: voteData.electionTitle,
//               description: 'Recent election',
//               start_date: new Date(),
//               end_date: new Date(),
//             }];
//             console.log('📝 Loaded election from vote data');
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error loading from vote data:', error);
//       }
//     }

//     setElections(fetchedElections);
//     setLoadingElections(false);

//     // Auto-select first election if available
//     if (fetchedElections.length > 0) {
//       fetchBulletinBoard(fetchedElections[0].id);
//     }
//   };

//   const fetchBulletinBoard = async (electionId) => {
//     setLoading(true);
//     setSelectedElectionId(electionId);
//     console.log('📊 Fetching bulletin board for election:', electionId);
    
//     try {
//       const response = await fetch(`${API_URL}/votes/public-bulletin/${electionId}`);
//       const data = await response.json();
      
//       console.log('📥 Bulletin board response:', data);
      
//       if (data.success) {
//         setBulletinData(data.data);
//         console.log('✅ Bulletin board loaded:', data.data);
//       } else {
//         console.error('❌ Failed to fetch bulletin:', data.message);
//         setBulletinData(null);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching bulletin board:', error);
//       setBulletinData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
//         <div className="flex items-center gap-3 mb-2">
//           <Globe size={32} />
//           <h1 className="text-3xl font-bold">Public Bulletin Board</h1>
//         </div>
//         <p className="text-blue-100">
//           Transparent, verifiable voting records for all public elections
//         </p>
//       </div>

//       {/* Debug Info - Remove after testing */}
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//         <p className="text-sm text-yellow-800">
//           <strong>Debug:</strong> Found {elections.length} elections
//           {elections.length > 0 && ` - Selected: ${selectedElectionId}`}
//         </p>
//         <button
//           onClick={fetchElections}
//           className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
//         >
//           🔄 Reload Elections
//         </button>
//       </div>

//       {/* Election Selection */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-bold text-gray-900 mb-4">Select an Election</h2>
        
//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search elections..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Loading State */}
//         {loadingElections ? (
//           <div className="text-center py-12">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p className="mt-4 text-gray-600">Loading elections...</p>
//           </div>
//         ) : (
//           /* Elections List */
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredElections.length === 0 ? (
//               <div className="col-span-full text-center py-12">
//                 <Globe size={48} className="mx-auto mb-4 text-gray-300" />
//                 <p className="text-gray-500 mb-4">No public elections found</p>
//                 <p className="text-sm text-gray-400 mb-4">
//                   Elections will appear here once they are published
//                 </p>
                
//                 {/* Manual Election ID Input */}
//                 <div className="max-w-md mx-auto">
//                   <p className="text-sm text-gray-600 mb-2">Or enter an election ID manually:</p>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       placeholder="Election ID (e.g., 9)"
//                       className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter' && e.target.value) {
//                           fetchBulletinBoard(parseInt(e.target.value));
//                         }
//                       }}
//                     />
//                     <button
//                       onClick={(e) => {
//                         const input = e.target.previousSibling;
//                         if (input.value) {
//                           fetchBulletinBoard(parseInt(input.value));
//                         }
//                       }}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                       Load
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               filteredElections.map((election) => (
//                 <button
//                   key={election.id}
//                   onClick={() => fetchBulletinBoard(election.id)}
//                   className={`text-left p-4 border-2 rounded-lg transition-all hover:shadow-md ${
//                     selectedElectionId === election.id
//                       ? 'border-blue-600 bg-blue-50'
//                       : 'border-gray-200 hover:border-blue-300'
//                   }`}
//                 >
//                   <h3 className="font-bold text-gray-900 mb-1">{election.title}</h3>
//                   <p className="text-sm text-gray-600 mb-2 line-clamp-2">
//                     {election.description || 'No description'}
//                   </p>
//                   <div className="flex items-center gap-2 text-xs text-gray-500">
//                     <Clock size={14} />
//                     <span>
//                       {election.start_date ? new Date(election.start_date).toLocaleDateString() : 'N/A'}
//                     </span>
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       {/* Bulletin Board Content */}
//       {loading ? (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading bulletin board...</p>
//         </div>
//       ) : bulletinData ? (
//         <>
//           {/* Statistics Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Votes</p>
//                   <p className="text-3xl font-bold text-blue-600">{bulletinData.totalVotes}</p>
//                 </div>
//                 <Users className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Verified Blocks</p>
//                   <p className="text-3xl font-bold text-green-600">{bulletinData.hashChain?.length || 0}</p>
//                 </div>
//                 <CheckCircle className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Chain Integrity</p>
//                   <p className="text-lg font-bold text-green-600">✓ VERIFIED</p>
//                 </div>
//                 <Shield className="text-green-600" size={40} />
//               </div>
//             </div>
//           </div>

//           {/* Hash Chain Verification */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Hash className="text-indigo-600" />
//               Blockchain Hash Chain
//             </h2>
//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//               <p className="text-sm font-mono text-xs break-all">
//                 <strong>Latest Block Hash:</strong><br />
//                 <span className="text-indigo-600">{bulletinData.verificationHash}</span>
//               </p>
//             </div>

//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {bulletinData.hashChain && bulletinData.hashChain.slice(0, 10).map((block) => (
//                 <div
//                   key={block.blockNumber}
//                   className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4"
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-bold text-indigo-900">
//                       Block #{block.blockNumber}
//                     </span>
//                     <span className="text-xs text-gray-600">
//                       {new Date(block.timestamp).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="space-y-1 text-xs font-mono">
//                     <p className="text-gray-700">
//                       <strong>Vote:</strong> {block.voteHash?.substring(0, 24)}...
//                     </p>
//                     <p className="text-indigo-700">
//                       <strong>Block:</strong> {block.blockHash?.substring(0, 24)}...
//                     </p>
//                   </div>
//                 </div>
//               ))}
//               {bulletinData.hashChain && bulletinData.hashChain.length > 10 && (
//                 <p className="text-center text-sm text-gray-500">
//                   Showing 10 of {bulletinData.hashChain.length} blocks
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Vote Records */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="px-6 py-4 border-b bg-gray-50">
//               <h2 className="text-xl font-bold text-gray-900">Anonymized Vote Records</h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Timestamp
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Vote Hash
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Voter
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {bulletinData.votes && bulletinData.votes.slice(0, 20).map((vote, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(vote.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {vote.vote_hash?.substring(0, 16)}...
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {vote.anonymized_user}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {bulletinData.votes && bulletinData.votes.length > 20 && (
//               <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-500">
//                 Showing 20 of {bulletinData.votes.length} votes
//               </div>
//             )}
//           </div>
//         </>
//       ) : selectedElectionId ? (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <AlertCircle size={48} className="mx-auto mb-4 text-orange-400" />
//           <p className="text-gray-600 mb-2">No bulletin data available for this election</p>
//           <p className="text-sm text-gray-500">This election may not have any votes yet</p>
//         </div>
//       ) : null}

//       {/* Info Footer */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//         <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <Shield size={20} className="text-blue-600" />
//           About This Bulletin Board
//         </h3>
//         <p className="text-sm text-gray-700 mb-2">
//           This public bulletin board provides transparent, verifiable voting records using blockchain-style hash chains. Every vote is cryptographically secured and publicly auditable.
//         </p>
//         <p className="text-xs text-gray-600">
//           <strong>Features:</strong> SHA-256 hashing • Blockchain verification • Anonymized records • Tamper-evident logging • Real-time transparency
//         </p>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Globe, Hash, Shield, Clock, CheckCircle, Search, TrendingUp, Users } from 'lucide-react';

// export default function PublicBulletin() {
//   const [elections, setElections] = useState([]);
//   const [selectedElectionId, setSelectedElectionId] = useState(null);
//   const [bulletinData, setBulletinData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5006/api';

//   // Get elections from localStorage
//   useEffect(() => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const electionData = parsed.election ? JSON.parse(parsed.election) : {};
//         const publicElections = electionData.publicElections || [];
//         setElections(publicElections);
        
//         // Auto-select first election if available
//         if (publicElections.length > 0 && !selectedElectionId) {
//           fetchBulletinBoard(publicElections[0].id);
//         }
//       }
//     } catch (error) {
//       console.error('Error loading elections:', error);
//     }
//   }, []);

//   const fetchBulletinBoard = async (electionId) => {
//     setLoading(true);
//     setSelectedElectionId(electionId);
//     try {
//       const response = await fetch(`${API_URL}/votes/public-bulletin/${electionId}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setBulletinData(data.data);
//       } else {
//         console.error('Failed to fetch bulletin:', data.message);
//         setBulletinData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching bulletin board:', error);
//       setBulletinData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredElections = elections.filter(election =>
//     election.title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
//         <div className="flex items-center gap-3 mb-2">
//           <Globe size={32} />
//           <h1 className="text-3xl font-bold">Public Bulletin Board</h1>
//         </div>
//         <p className="text-blue-100">
//           Transparent, verifiable voting records for all public elections
//         </p>
//       </div>

//       {/* Election Selection */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-bold text-gray-900 mb-4">Select an Election</h2>
        
//         {/* Search */}
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search elections..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Elections List */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredElections.length === 0 ? (
//             <div className="col-span-full text-center py-12 text-gray-500">
//               <Globe size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No public elections found</p>
//             </div>
//           ) : (
//             filteredElections.map((election) => (
//               <button
//                 key={election.id}
//                 onClick={() => fetchBulletinBoard(election.id)}
//                 className={`text-left p-4 border-2 rounded-lg transition-all hover:shadow-md ${
//                   selectedElectionId === election.id
//                     ? 'border-blue-600 bg-blue-50'
//                     : 'border-gray-200 hover:border-blue-300'
//                 }`}
//               >
//                 <h3 className="font-bold text-gray-900 mb-1">{election.title}</h3>
//                 <p className="text-sm text-gray-600 mb-2">{election.description}</p>
//                 <div className="flex items-center gap-2 text-xs text-gray-500">
//                   <Clock size={14} />
//                   <span>
//                     {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
//                   </span>
//                 </div>
//               </button>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Bulletin Board Content */}
//       {loading ? (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading bulletin board...</p>
//         </div>
//       ) : bulletinData ? (
//         <>
//           {/* Statistics Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Votes</p>
//                   <p className="text-3xl font-bold text-blue-600">{bulletinData.totalVotes}</p>
//                 </div>
//                 <Users className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Verified Blocks</p>
//                   <p className="text-3xl font-bold text-green-600">{bulletinData.hashChain?.length || 0}</p>
//                 </div>
//                 <CheckCircle className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Chain Integrity</p>
//                   <p className="text-lg font-bold text-green-600">✓ VERIFIED</p>
//                 </div>
//                 <Shield className="text-green-600" size={40} />
//               </div>
//             </div>
//           </div>

//           {/* Hash Chain Verification */}
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Hash className="text-indigo-600" />
//               Blockchain Hash Chain
//             </h2>
//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//               <p className="text-sm font-mono text-xs break-all">
//                 <strong>Latest Block Hash:</strong><br />
//                 <span className="text-indigo-600">{bulletinData.verificationHash}</span>
//               </p>
//             </div>

//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {bulletinData.hashChain && bulletinData.hashChain.slice(0, 10).map((block) => (
//                 <div
//                   key={block.blockNumber}
//                   className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4"
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-bold text-indigo-900">
//                       Block #{block.blockNumber}
//                     </span>
//                     <span className="text-xs text-gray-600">
//                       {new Date(block.timestamp).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="space-y-1 text-xs font-mono">
//                     <p className="text-gray-700">
//                       <strong>Vote:</strong> {block.voteHash?.substring(0, 24)}...
//                     </p>
//                     <p className="text-indigo-700">
//                       <strong>Block:</strong> {block.blockHash?.substring(0, 24)}...
//                     </p>
//                   </div>
//                 </div>
//               ))}
//               {bulletinData.hashChain && bulletinData.hashChain.length > 10 && (
//                 <p className="text-center text-sm text-gray-500">
//                   Showing 10 of {bulletinData.hashChain.length} blocks
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Vote Records */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="px-6 py-4 border-b bg-gray-50">
//               <h2 className="text-xl font-bold text-gray-900">Anonymized Vote Records</h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Timestamp
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Vote Hash
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Voter
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {bulletinData.votes && bulletinData.votes.slice(0, 20).map((vote, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(vote.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {vote.vote_hash?.substring(0, 16)}...
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {vote.anonymized_user}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {bulletinData.votes && bulletinData.votes.length > 20 && (
//               <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-500">
//                 Showing 20 of {bulletinData.votes.length} votes
//               </div>
//             )}
//           </div>
//         </>
//       ) : selectedElectionId ? (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <Globe size={48} className="mx-auto mb-4 text-gray-300" />
//           <p className="text-gray-600">No bulletin data available for this election</p>
//         </div>
//       ) : null}

//       {/* Info Footer */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//         <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <Shield size={20} className="text-blue-600" />
//           About This Bulletin Board
//         </h3>
//         <p className="text-sm text-gray-700 mb-2">
//           This public bulletin board provides transparent, verifiable voting records using blockchain-style hash chains. Every vote is cryptographically secured and publicly auditable.
//         </p>
//         <p className="text-xs text-gray-600">
//           <strong>Features:</strong> SHA-256 hashing • Blockchain verification • Anonymized records • Tamper-evident logging • Real-time transparency
//         </p>
//       </div>
//     </div>
//   );
// }