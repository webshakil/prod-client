// src/components/Dashboard/Tabs/VoteNow.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
import { getAllElections } from '../../../redux/api/election/electionApi';

export default function VoteNow() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchElections();
    const interval = setInterval(fetchElections, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllElections(1, 50, 'all');
      
      const allElections = response.data?.elections || response.elections || [];
      
      let filteredElections = allElections;
      const now = new Date();
      
      if (filter === 'active') {
        filteredElections = allElections.filter(election => {
          const startDate = new Date(election.start_date);
          const endDate = new Date(election.end_date);
          const isInDateRange = now.getTime() >= (startDate.getTime() - 60000) && now <= endDate;
          const isPublished = election.status === 'active' || election.status === 'published';
          return isInDateRange && isPublished;
        });
      } else if (filter === 'upcoming') {
        filteredElections = allElections.filter(election => {
          const startDate = new Date(election.start_date);
          return now.getTime() < (startDate.getTime() - 60000);
        });
      } else if (filter === 'ended') {
        filteredElections = allElections.filter(election => {
          const endDate = new Date(election.end_date);
          return now > endDate;
        });
      }
      
      setElections(filteredElections);
      
    } catch (error) {
      console.error('Error fetching elections:', error);
      setError(error.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const getElectionVotingStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    const isPublished = election.status === 'active' || election.status === 'published';
    
    const nowTime = now.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    const hasStarted = nowTime >= (startTime - 60000);
    const hasEnded = nowTime > endTime;
    const isActive = hasStarted && !hasEnded;
    
    if (election.status === 'draft') {
      return {
        canVote: false,
        reason: 'This election is still in draft mode',
        buttonText: 'Draft - Cannot Vote',
        icon: <Lock size={20} />
      };
    }
    
    if (hasEnded) {
      return {
        canVote: false,
        reason: `Election ended on ${formatDateTime(election.end_date)}`,
        buttonText: 'Election Ended',
        icon: <Lock size={20} />
      };
    }
    
    if (!hasStarted && isPublished) {
      const msUntilStart = startTime - nowTime;
      
      if (msUntilStart < 60000) {
        return {
          canVote: true,
          reason: null,
          buttonText: 'Vote Now',
          icon: <Vote size={20} />
        };
      }
      
      const minutesUntilStart = Math.floor(msUntilStart / (1000 * 60));
      const hoursUntilStart = Math.floor(msUntilStart / (1000 * 60 * 60));
      const daysUntilStart = Math.floor(hoursUntilStart / 24);
      
      let timeText;
      if (minutesUntilStart < 60) {
        timeText = `in ${minutesUntilStart} minutes`;
      } else if (hoursUntilStart < 24) {
        timeText = `in ${hoursUntilStart} hours`;
      } else if (daysUntilStart === 1) {
        timeText = 'tomorrow';
      } else {
        timeText = `in ${daysUntilStart} days`;
      }
      
      return {
        canVote: false,
        reason: `Election starts ${timeText} (${formatDateTime(election.start_date)})`,
        buttonText: `Starts ${timeText}`,
        icon: <Clock size={20} />
      };
    }
    
    if (isActive && isPublished) {
      return {
        canVote: true,
        reason: null,
        buttonText: 'Vote Now',
        icon: <Vote size={20} />
      };
    }
    
    return {
      canVote: false,
      reason: 'Election is not available for voting',
      buttonText: 'Cannot Vote',
      icon: <Lock size={20} />
    };
  };

  // ✅ FIXED: Always use election ID
  const handleVoteClick = (election) => {
    const votingStatus = getElectionVotingStatus(election);
    
    if (!votingStatus.canVote) {
      console.log('❌ Cannot vote:', votingStatus.reason);
      return;
    }
    
    console.log('✅ Voting allowed, navigating to election ID:', election.id);
    
    // ✅ ALWAYS use election ID (not slug)
    navigate(`/vote/${election.id}`);
  };

  const getStatusBadge = (election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    if (election.status === 'draft') {
      return <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">📝 Draft</span>;
    } else if (now.getTime() < (startDate.getTime() - 60000)) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">📅 Upcoming</span>;
    } else if (now > endDate) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">🔒 Ended</span>;
    } else {
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✅ Active</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-red-600 font-semibold mb-2">Error Loading Elections</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchElections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
        <p className="text-gray-600">Participate in elections</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Now
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'ended' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ended
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {elections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Vote size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Available</h3>
            <p className="text-gray-600">
              {filter === 'all' && 'There are no elections available at the moment.'}
              {filter === 'active' && 'There are no active elections right now.'}
              {filter === 'upcoming' && 'No upcoming elections scheduled.'}
              {filter === 'ended' && 'No ended elections found.'}
            </p>
          </div>
        ) : (
          elections.map((election) => {
            const votingStatus = getElectionVotingStatus(election);
            
            return (
              <div key={election.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                        {getStatusBadge(election)}
                        {election.lottery_config?.is_lotterized && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">🎰 Lottery</span>
                        )}
                        {!election.is_free && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">💰 Paid</span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{election.description}</p>
                    </div>
                  </div>

                  {election.topic_image_url && (
                    <img src={election.topic_image_url} alt={election.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-sm text-gray-600">
                      <p className="text-xs text-gray-500 mb-1">Start</p>
                      <p className="font-medium">{formatDate(election.start_date)}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="text-xs text-gray-500 mb-1">End</p>
                      <p className="font-medium">{formatDate(election.end_date)}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="text-xs text-gray-500 mb-1">Votes</p>
                      <p className="font-medium">{election.vote_count || 0}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="text-xs text-gray-500 mb-1">Fee</p>
                      <p className="font-medium">{election.is_free ? 'Free' : `$${election.general_participation_fee || '5.00'}`}</p>
                    </div>
                  </div>

                  {election.lottery_config?.is_lotterized && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎰</span>
                        <h4 className="font-bold text-purple-900">Lottery Draw Included!</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-purple-700">Prize Pool</p>
                          <p className="font-bold text-purple-900">{election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || '100'}`}</p>
                        </div>
                        <div>
                          <p className="text-purple-700">Winners</p>
                          <p className="font-bold text-purple-900">{election.lottery_config.winner_count}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!votingStatus.canVote && votingStatus.reason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Cannot Vote</p>
                        <p className="text-sm text-yellow-700">{votingStatus.reason}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleVoteClick(election)}
                    disabled={!votingStatus.canVote}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
                      votingStatus.canVote
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {votingStatus.icon}
                    {votingStatus.buttonText}
                    {votingStatus.canVote && <ArrowRight size={20} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
//last workable code
// // src/components/Dashboard/Tabs/VoteNow.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
// import { getPublicElections, getMyElections } from '../../../redux/api/election/electionApi';

// export default function VoteNow() {
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchElections();
//     const interval = setInterval(fetchElections, 30000);
//     return () => clearInterval(interval);
//   }, [filter]);

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     return `${day}/${month}/${year} ${hours}:${minutes}`;
//   };

//   const fetchElections = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const [publicResponse, myResponse] = await Promise.all([
//         getPublicElections(1, 50).catch(() => ({ data: { elections: [] } })),
//         getMyElections(1, 50, 'all').catch(() => ({ data: { elections: [] } }))
//       ]);
      
//       const publicElections = publicResponse.data?.elections || publicResponse.elections || [];
//       const myElections = myResponse.data?.elections || myResponse.elections || [];
      
//       const allElections = [...publicElections];
//       myElections.forEach(election => {
//         if (!allElections.find(e => e.id === election.id)) {
//           allElections.push(election);
//         }
//       });
      
//       let filteredElections = allElections;
//       const now = new Date();
      
//       if (filter === 'active') {
//         filteredElections = allElections.filter(election => {
//           const startDate = new Date(election.start_date);
//           const endDate = new Date(election.end_date);
//           const isInDateRange = now.getTime() >= (startDate.getTime() - 60000) && now <= endDate;
//           const isPublished = election.status === 'active' || election.status === 'published';
//           return isInDateRange && isPublished;
//         });
//       } else if (filter === 'upcoming') {
//         filteredElections = allElections.filter(election => {
//           const startDate = new Date(election.start_date);
//           return now.getTime() < (startDate.getTime() - 60000);
//         });
//       } else if (filter === 'ended') {
//         filteredElections = allElections.filter(election => {
//           const endDate = new Date(election.end_date);
//           return now > endDate;
//         });
//       }
      
//       setElections(filteredElections);
      
//     } catch (error) {
//       console.error('Error fetching elections:', error);
//       setError(error.message || 'Failed to load elections');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getElectionVotingStatus = (election) => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     const isPublished = election.status === 'active' || election.status === 'published';
    
//     const nowTime = now.getTime();
//     const startTime = startDate.getTime();
//     const endTime = endDate.getTime();
    
//     const hasStarted = nowTime >= (startTime - 60000);
//     const hasEnded = nowTime > endTime;
//     const isActive = hasStarted && !hasEnded;
    
//     if (election.status === 'draft') {
//       return {
//         canVote: false,
//         reason: 'This election is still in draft mode',
//         buttonText: 'Draft - Cannot Vote',
//         icon: <Lock size={20} />
//       };
//     }
    
//     if (hasEnded) {
//       return {
//         canVote: false,
//         reason: `Election ended on ${formatDateTime(election.end_date)}`,
//         buttonText: 'Election Ended',
//         icon: <Lock size={20} />
//       };
//     }
    
//     if (!hasStarted && isPublished) {
//       const msUntilStart = startTime - nowTime;
      
//       if (msUntilStart < 60000) {
//         return {
//           canVote: true,
//           reason: null,
//           buttonText: 'Vote Now',
//           icon: <Vote size={20} />
//         };
//       }
      
//       const minutesUntilStart = Math.floor(msUntilStart / (1000 * 60));
//       const hoursUntilStart = Math.floor(msUntilStart / (1000 * 60 * 60));
//       const daysUntilStart = Math.floor(hoursUntilStart / 24);
      
//       let timeText;
//       if (minutesUntilStart < 60) {
//         timeText = `in ${minutesUntilStart} minutes`;
//       } else if (hoursUntilStart < 24) {
//         timeText = `in ${hoursUntilStart} hours`;
//       } else if (daysUntilStart === 1) {
//         timeText = 'tomorrow';
//       } else {
//         timeText = `in ${daysUntilStart} days`;
//       }
      
//       return {
//         canVote: false,
//         reason: `Election starts ${timeText} (${formatDateTime(election.start_date)})`,
//         buttonText: `Starts ${timeText}`,
//         icon: <Clock size={20} />
//       };
//     }
    
//     if (isActive && isPublished) {
//       return {
//         canVote: true,
//         reason: null,
//         buttonText: 'Vote Now',
//         icon: <Vote size={20} />
//       };
//     }
    
//     return {
//       canVote: false,
//       reason: 'Election is not available for voting',
//       buttonText: 'Cannot Vote',
//       icon: <Lock size={20} />
//     };
//   };

//   // ✅ FIXED: Always use election ID
//   const handleVoteClick = (election) => {
//     const votingStatus = getElectionVotingStatus(election);
    
//     if (!votingStatus.canVote) {
//       console.log('❌ Cannot vote:', votingStatus.reason);
//       return;
//     }
    
//     console.log('✅ Voting allowed, navigating to election ID:', election.id);
    
//     // ✅ ALWAYS use election ID (not slug)
//     navigate(`/vote/${election.id}`);
//   };

//   const getStatusBadge = (election) => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     if (election.status === 'draft') {
//       return <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">📝 Draft</span>;
//     } else if (now.getTime() < (startDate.getTime() - 60000)) {
//       return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">📅 Upcoming</span>;
//     } else if (now > endDate) {
//       return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">🔒 Ended</span>;
//     } else {
//       return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✅ Active</span>;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-gray-600 text-sm mb-4">{error}</p>
//           <button
//             onClick={fetchElections}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
//         <p className="text-gray-600">Participate in elections</p>
//       </div>

//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex gap-2 flex-wrap">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setFilter('active')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Active Now
//           </button>
//           <button
//             onClick={() => setFilter('upcoming')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Upcoming
//           </button>
//           <button
//             onClick={() => setFilter('ended')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'ended' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Ended
//           </button>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {elections.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <Vote size={64} className="mx-auto mb-4 text-gray-300" />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Available</h3>
//             <p className="text-gray-600">
//               {filter === 'all' && 'There are no elections available at the moment.'}
//               {filter === 'active' && 'There are no active elections right now.'}
//               {filter === 'upcoming' && 'No upcoming elections scheduled.'}
//               {filter === 'ended' && 'No ended elections found.'}
//             </p>
//           </div>
//         ) : (
//           elections.map((election) => {
//             const votingStatus = getElectionVotingStatus(election);
            
//             return (
//               <div key={election.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2 flex-wrap">
//                         <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
//                         {getStatusBadge(election)}
//                         {election.lottery_config?.is_lotterized && (
//                           <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">🎰 Lottery</span>
//                         )}
//                         {!election.is_free && (
//                           <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">💰 Paid</span>
//                         )}
//                       </div>
//                       <p className="text-gray-600 mb-4">{election.description}</p>
//                     </div>
//                   </div>

//                   {election.topic_image_url && (
//                     <img src={election.topic_image_url} alt={election.title} className="w-full h-48 object-cover rounded-lg mb-4" />
//                   )}

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Start</p>
//                       <p className="font-medium">{formatDate(election.start_date)}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">End</p>
//                       <p className="font-medium">{formatDate(election.end_date)}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Votes</p>
//                       <p className="font-medium">{election.vote_count || 0}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Fee</p>
//                       <p className="font-medium">{election.is_free ? 'Free' : `$${election.general_participation_fee || '5.00'}`}</p>
//                     </div>
//                   </div>

//                   {election.lottery_config?.is_lotterized && (
//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-2xl">🎰</span>
//                         <h4 className="font-bold text-purple-900">Lottery Draw Included!</h4>
//                       </div>
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p className="text-purple-700">Prize Pool</p>
//                           <p className="font-bold text-purple-900">{election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || '100'}`}</p>
//                         </div>
//                         <div>
//                           <p className="text-purple-700">Winners</p>
//                           <p className="font-bold text-purple-900">{election.lottery_config.winner_count}</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {!votingStatus.canVote && votingStatus.reason && (
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
//                       <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
//                       <div className="flex-1">
//                         <p className="text-sm font-semibold text-yellow-800 mb-1">Cannot Vote</p>
//                         <p className="text-sm text-yellow-700">{votingStatus.reason}</p>
//                       </div>
//                     </div>
//                   )}

//                   <button
//                     onClick={() => handleVoteClick(election)}
//                     disabled={!votingStatus.canVote}
//                     className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
//                       votingStatus.canVote
//                         ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     {votingStatus.icon}
//                     {votingStatus.buttonText}
//                     {votingStatus.canVote && <ArrowRight size={20} />}
//                   </button>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }
//last workable codes
// // src/components/Dashboard/Tabs/VoteNow.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
// import { getPublicElections, getMyElections } from '../../../redux/api/election/electionApi';

// export default function VoteNow() {
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchElections();
//     // ✅ Refresh every 30 seconds to update "starts in X minutes"
//     const interval = setInterval(fetchElections, 30000);
//     return () => clearInterval(interval);
//   }, [filter]);

//   // Format date as DD/MM/YYYY
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Format date with time as DD/MM/YYYY HH:MM
//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     return `${day}/${month}/${year} ${hours}:${minutes}`;
//   };

//   const fetchElections = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const [publicResponse, myResponse] = await Promise.all([
//         getPublicElections(1, 50).catch(() => ({ data: { elections: [] } })),
//         getMyElections(1, 50, 'all').catch(() => ({ data: { elections: [] } }))
//       ]);
      
//       const publicElections = publicResponse.data?.elections || publicResponse.elections || [];
//       const myElections = myResponse.data?.elections || myResponse.elections || [];
      
//       const allElections = [...publicElections];
//       myElections.forEach(election => {
//         if (!allElections.find(e => e.id === election.id)) {
//           allElections.push(election);
//         }
//       });
      
//       // Apply filters
//       let filteredElections = allElections;
//       const now = new Date();
      
//       if (filter === 'active') {
//         filteredElections = allElections.filter(election => {
//           const startDate = new Date(election.start_date);
//           const endDate = new Date(election.end_date);
//           // ✅ Include elections starting within 1 minute
//           const isInDateRange = now.getTime() >= (startDate.getTime() - 60000) && now <= endDate;
//           const isPublished = election.status === 'active' || election.status === 'published';
//           return isInDateRange && isPublished;
//         });
//       } else if (filter === 'upcoming') {
//         filteredElections = allElections.filter(election => {
//           const startDate = new Date(election.start_date);
//           // More than 1 minute away
//           return now.getTime() < (startDate.getTime() - 60000);
//         });
//       } else if (filter === 'ended') {
//         filteredElections = allElections.filter(election => {
//           const endDate = new Date(election.end_date);
//           return now > endDate;
//         });
//       }
      
//       setElections(filteredElections);
      
//     } catch (error) {
//       console.error('Error fetching elections:', error);
//       setError(error.message || 'Failed to load elections');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ FIXED: Correct voting status logic
//   const getElectionVotingStatus = (election) => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     console.log('=== VOTING STATUS CHECK ===');
//     console.log('Election:', election.title);
//     console.log('Now:', now.toISOString());
//     console.log('Start:', startDate.toISOString());
//     console.log('End:', endDate.toISOString());
//     console.log('Status:', election.status);
    
//     const isPublished = election.status === 'active' || election.status === 'published';
    
//     // ✅ FIXED: Use getTime() for accurate millisecond comparison
//     const nowTime = now.getTime();
//     const startTime = startDate.getTime();
//     const endTime = endDate.getTime();
    
//     // ✅ FIXED: 1 minute buffer for "starts now"
//     const hasStarted = nowTime >= (startTime - 60000);
//     const hasEnded = nowTime > endTime;
//     const isActive = hasStarted && !hasEnded;
    
//     console.log('Time comparison:');
//     console.log('  nowTime:', nowTime);
//     console.log('  startTime:', startTime);
//     console.log('  endTime:', endTime);
//     console.log('  hasStarted:', hasStarted);
//     console.log('  hasEnded:', hasEnded);
//     console.log('  isActive:', isActive);
    
//     // Draft elections
//     if (election.status === 'draft') {
//       return {
//         canVote: false,
//         reason: 'This election is still in draft mode',
//         buttonText: 'Draft - Cannot Vote',
//         icon: <Lock size={20} />
//       };
//     }
    
//     // Ended
//     if (hasEnded) {
//       return {
//         canVote: false,
//         reason: `Election ended on ${formatDateTime(election.end_date)}`,
//         buttonText: 'Election Ended',
//         icon: <Lock size={20} />
//       };
//     }
    
//     // Not started yet
//     if (!hasStarted && isPublished) {
//       const msUntilStart = startTime - nowTime;
      
//       // ✅ If less than 1 minute, treat as active
//       if (msUntilStart < 60000) {
//         return {
//           canVote: true,
//           reason: null,
//           buttonText: 'Vote Now',
//           icon: <Vote size={20} />
//         };
//       }
      
//       const minutesUntilStart = Math.floor(msUntilStart / (1000 * 60));
//       const hoursUntilStart = Math.floor(msUntilStart / (1000 * 60 * 60));
//       const daysUntilStart = Math.floor(hoursUntilStart / 24);
      
//       let timeText;
//       if (minutesUntilStart < 60) {
//         timeText = `in ${minutesUntilStart} minutes`;
//       } else if (hoursUntilStart < 24) {
//         timeText = `in ${hoursUntilStart} hours`;
//       } else if (daysUntilStart === 1) {
//         timeText = 'tomorrow';
//       } else {
//         timeText = `in ${daysUntilStart} days`;
//       }
      
//       return {
//         canVote: false,
//         reason: `Election starts ${timeText} (${formatDateTime(election.start_date)})`,
//         buttonText: `Starts ${timeText}`,
//         icon: <Clock size={20} />
//       };
//     }
    
//     // ✅ Active and votable
//     if (isActive && isPublished) {
//       console.log('✅ ELECTION IS ACTIVE - VOTING ALLOWED');
//       return {
//         canVote: true,
//         reason: null,
//         buttonText: 'Vote Now',
//         icon: <Vote size={20} />
//       };
//     }
    
//     // Fallback
//     return {
//       canVote: false,
//       reason: 'Election is not available for voting',
//       buttonText: 'Cannot Vote',
//       icon: <Lock size={20} />
//     };
//   };

//   const handleVoteClick = (election) => {
//     const votingStatus = getElectionVotingStatus(election);
    
//     if (!votingStatus.canVote) {
//       console.log('Cannot vote:', votingStatus.reason);
//       return;
//     }
    
//     console.log('✅ Voting allowed, navigating...');
    
//     const hasAdvancedFeatures = !election.is_free || election.lottery_config?.is_lotterized;
    
//     if (hasAdvancedFeatures) {
//       navigate(`/vote-new/${election.slug}`);
//     } else {
//       navigate(`/vote/${election.slug}`);
//     }
//   };

//   const getStatusBadge = (election) => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     if (election.status === 'draft') {
//       return <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">📝 Draft</span>;
//     } else if (now.getTime() < (startDate.getTime() - 60000)) {
//       return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">📅 Upcoming</span>;
//     } else if (now > endDate) {
//       return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">🔒 Ended</span>;
//     } else {
//       return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✅ Active</span>;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-gray-600 text-sm mb-4">{error}</p>
//           <button
//             onClick={fetchElections}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
//         <p className="text-gray-600">Participate in elections</p>
//       </div>

//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex gap-2 flex-wrap">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setFilter('active')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Active Now
//           </button>
//           <button
//             onClick={() => setFilter('upcoming')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Upcoming
//           </button>
//           <button
//             onClick={() => setFilter('ended')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'ended' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Ended
//           </button>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {elections.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <Vote size={64} className="mx-auto mb-4 text-gray-300" />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Available</h3>
//             <p className="text-gray-600">
//               {filter === 'all' && 'There are no elections available at the moment.'}
//               {filter === 'active' && 'There are no active elections right now.'}
//               {filter === 'upcoming' && 'No upcoming elections scheduled.'}
//               {filter === 'ended' && 'No ended elections found.'}
//             </p>
//           </div>
//         ) : (
//           elections.map((election) => {
//             const votingStatus = getElectionVotingStatus(election);
            
//             return (
//               <div key={election.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2 flex-wrap">
//                         <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
//                         {getStatusBadge(election)}
//                         {election.lottery_config?.is_lotterized && (
//                           <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">🎰 Lottery</span>
//                         )}
//                         {!election.is_free && (
//                           <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">💰 Paid</span>
//                         )}
//                       </div>
//                       <p className="text-gray-600 mb-4">{election.description}</p>
//                     </div>
//                   </div>

//                   {election.topic_image_url && (
//                     <img src={election.topic_image_url} alt={election.title} className="w-full h-48 object-cover rounded-lg mb-4" />
//                   )}

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Start</p>
//                       <p className="font-medium">{formatDate(election.start_date)}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">End</p>
//                       <p className="font-medium">{formatDate(election.end_date)}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Votes</p>
//                       <p className="font-medium">{election.vote_count || 0}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Fee</p>
//                       <p className="font-medium">{election.is_free ? 'Free' : `$${election.general_participation_fee || '5.00'}`}</p>
//                     </div>
//                   </div>

//                   {election.lottery_config?.is_lotterized && (
//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-2xl">🎰</span>
//                         <h4 className="font-bold text-purple-900">Lottery Draw Included!</h4>
//                       </div>
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p className="text-purple-700">Prize Pool</p>
//                           <p className="font-bold text-purple-900">${election.lottery_config.reward_amount || '100'}</p>
//                         </div>
//                         <div>
//                           <p className="text-purple-700">Winners</p>
//                           <p className="font-bold text-purple-900">{election.lottery_config.winner_count}</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {!votingStatus.canVote && votingStatus.reason && (
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
//                       <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
//                       <div className="flex-1">
//                         <p className="text-sm font-semibold text-yellow-800 mb-1">Cannot Vote</p>
//                         <p className="text-sm text-yellow-700">{votingStatus.reason}</p>
//                       </div>
//                     </div>
//                   )}

//                   <button
//                     onClick={() => handleVoteClick(election)}
//                     disabled={!votingStatus.canVote}
//                     className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
//                       votingStatus.canVote
//                         ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     {votingStatus.icon}
//                     {votingStatus.buttonText}
//                     {votingStatus.canVote && <ArrowRight size={20} />}
//                   </button>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/VoteNow.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
// import { getPublicElections, getMyElections } from '../../../redux/api/election/electionApi';

// export default function VoteNow() {
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchElections();
//   }, [filter]);

//   // ✅ FIXED: Format date as DD/MM/YYYY
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // ✅ FIXED: Format date with time as DD/MM/YYYY HH:MM
//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     return `${day}/${month}/${year} ${hours}:${minutes}`;
//   };

//   const fetchElections = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const [publicResponse, myResponse] = await Promise.all([
//         getPublicElections(1, 50).catch(() => ({ data: { elections: [] } })),
//         getMyElections(1, 50, 'all').catch(() => ({ data: { elections: [] } }))
//       ]);
      
//       const publicElections = publicResponse.data?.elections || publicResponse.elections || [];
//       const myElections = myResponse.data?.elections || myResponse.elections || [];
      
//       const allElections = [...publicElections];
//       myElections.forEach(election => {
//         if (!allElections.find(e => e.id === election.id)) {
//           allElections.push(election);
//         }
//       });
      
//       // Apply filters
//       let filteredElections = allElections;
//       const now = new Date();
      
//       if (filter === 'active') {
//         filteredElections = allElections.filter(election => {
//           const startDate = new Date(election.start_date);
//           const endDate = new Date(election.end_date);
//           // ✅ FIXED: Check if NOW is between start and end (inclusive)
//           const isInDateRange = now >= startDate && now <= endDate;
//           const isPublished = election.status === 'active' || election.status === 'published';
//           return isInDateRange && isPublished;
//         });
//       } else if (filter === 'upcoming') {
//         filteredElections = allElections.filter(election => {
//           const startDate = new Date(election.start_date);
//           // ✅ FIXED: Check if start date is in the FUTURE
//           return now < startDate;
//         });
//       } else if (filter === 'ended') {
//         filteredElections = allElections.filter(election => {
//           const endDate = new Date(election.end_date);
//           // ✅ FIXED: Check if end date is in the PAST
//           return now > endDate;
//         });
//       }
      
//       setElections(filteredElections);
      
//     } catch (error) {
//       console.error('Error fetching elections:', error);
//       setError(error.message || 'Failed to load elections');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ FIXED: Correct voting status logic
//   const getElectionVotingStatus = (election) => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     console.log('Checking election:', election.title);
//     console.log('Now:', now.toISOString());
//     console.log('Start:', startDate.toISOString());
//     console.log('End:', endDate.toISOString());
//     console.log('Status:', election.status);
    
//     // Check if election is published
//     const isPublished = election.status === 'active' || election.status === 'published';
    
//     // ✅ FIXED: Check dates correctly
//     const hasStarted = now >= startDate;
//     const hasEnded = now > endDate;
//     const isActive = hasStarted && !hasEnded;
    
//     console.log('Has started:', hasStarted, 'Has ended:', hasEnded, 'Is active:', isActive);
    
//     // Draft elections
//     if (election.status === 'draft') {
//       return {
//         canVote: false,
//         reason: 'This election is still in draft mode',
//         buttonText: 'Draft - Cannot Vote',
//         icon: <Lock size={20} />
//       };
//     }
    
//     // Not started yet - ✅ FIXED: Better time calculation
//     if (!hasStarted && isPublished) {
//       const msUntilStart = startDate - now;
//       const hoursUntilStart = Math.floor(msUntilStart / (1000 * 60 * 60));
//       const daysUntilStart = Math.floor(hoursUntilStart / 24);
      
//       let timeText;
//       if (hoursUntilStart < 1) {
//         const minutesUntilStart = Math.floor(msUntilStart / (1000 * 60));
//         timeText = `in ${minutesUntilStart} minutes`;
//       } else if (hoursUntilStart < 24) {
//         timeText = `in ${hoursUntilStart} hours`;
//       } else if (daysUntilStart === 1) {
//         timeText = 'tomorrow';
//       } else {
//         timeText = `in ${daysUntilStart} days`;
//       }
      
//       return {
//         canVote: false,
//         reason: `Election starts ${timeText} (${formatDateTime(election.start_date)})`,
//         buttonText: `Starts ${timeText}`,
//         icon: <Clock size={20} />
//       };
//     }
    
//     // Ended
//     if (hasEnded) {
//       return {
//         canVote: false,
//         reason: `Election ended on ${formatDateTime(election.end_date)}`,
//         buttonText: 'Election Ended',
//         icon: <Lock size={20} />
//       };
//     }
    
//     // ✅ Active and votable
//     if (isActive && isPublished) {
//       return {
//         canVote: true,
//         reason: null,
//         buttonText: 'Vote Now',
//         icon: <Vote size={20} />
//       };
//     }
    
//     // Fallback
//     return {
//       canVote: false,
//       reason: 'Election is not available for voting',
//       buttonText: 'Cannot Vote',
//       icon: <Lock size={20} />
//     };
//   };

//   const handleVoteClick = (election) => {
//     const votingStatus = getElectionVotingStatus(election);
    
//     if (!votingStatus.canVote) {
//       console.log('Cannot vote:', votingStatus.reason);
//       return;
//     }
    
//     console.log('Voting allowed, navigating...');
    
//     // Check if election has advanced features (payment/lottery)
//     const hasAdvancedFeatures = !election.is_free || election.lottery_config?.is_lotterized;
    
//     // Navigate to appropriate voting page
//     if (hasAdvancedFeatures) {
//       navigate(`/vote-new/${election.slug}`);
//     } else {
//       navigate(`/vote/${election.slug}`);
//     }
//   };

//   const getStatusBadge = (election) => {
//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);
    
//     if (election.status === 'draft') {
//       return <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">📝 Draft</span>;
//     } else if (now < startDate) {
//       return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">📅 Upcoming</span>;
//     } else if (now > endDate) {
//       return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">🔒 Ended</span>;
//     } else {
//       return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✅ Active</span>;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-gray-600 text-sm mb-4">{error}</p>
//           <button
//             onClick={fetchElections}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
//         <p className="text-gray-600">Participate in elections</p>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex gap-2 flex-wrap">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'all'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setFilter('active')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'active'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Active Now
//           </button>
//           <button
//             onClick={() => setFilter('upcoming')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'upcoming'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Upcoming
//           </button>
//           <button
//             onClick={() => setFilter('ended')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'ended'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Ended
//           </button>
//         </div>
//       </div>

//       {/* Elections List */}
//       <div className="space-y-4">
//         {elections.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-12 text-center">
//             <Vote size={64} className="mx-auto mb-4 text-gray-300" />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Available</h3>
//             <p className="text-gray-600">
//               {filter === 'all' && 'There are no elections available at the moment.'}
//               {filter === 'active' && 'There are no active elections right now.'}
//               {filter === 'upcoming' && 'No upcoming elections scheduled.'}
//               {filter === 'ended' && 'No ended elections found.'}
//             </p>
//           </div>
//         ) : (
//           elections.map((election) => {
//             const votingStatus = getElectionVotingStatus(election);
            
//             return (
//               <div
//                 key={election.id}
//                 className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow"
//               >
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2 flex-wrap">
//                         <h3 className="text-xl font-bold text-gray-800">
//                           {election.title}
//                         </h3>
//                         {getStatusBadge(election)}
//                         {election.lottery_config?.is_lotterized && (
//                           <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
//                             🎰 Lottery
//                           </span>
//                         )}
//                         {!election.is_free && (
//                           <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
//                             💰 Paid
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-gray-600 mb-4">{election.description}</p>
//                     </div>
//                   </div>

//                   {/* Election Image */}
//                   {election.topic_image_url && (
//                     <img
//                       src={election.topic_image_url}
//                       alt={election.title}
//                       className="w-full h-48 object-cover rounded-lg mb-4"
//                     />
//                   )}

//                   {/* Stats - ✅ FIXED: Human readable dates */}
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Start</p>
//                       <p className="font-medium">{formatDate(election.start_date)}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">End</p>
//                       <p className="font-medium">{formatDate(election.end_date)}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Votes</p>
//                       <p className="font-medium">{election.vote_count || 0}</p>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       <p className="text-xs text-gray-500 mb-1">Fee</p>
//                       <p className="font-medium">
//                         {election.is_free ? 'Free' : `$${election.general_participation_fee || '5.00'}`}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Lottery Info */}
//                   {election.lottery_config?.is_lotterized && (
//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-2xl">🎰</span>
//                         <h4 className="font-bold text-purple-900">Lottery Draw Included!</h4>
//                       </div>
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p className="text-purple-700">Prize Pool</p>
//                           <p className="font-bold text-purple-900">
//                             ${election.lottery_config.reward_amount || '100'}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-purple-700">Winners</p>
//                           <p className="font-bold text-purple-900">
//                             {election.lottery_config.winner_count}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Warning Message for non-votable elections */}
//                   {!votingStatus.canVote && votingStatus.reason && (
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
//                       <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
//                       <div className="flex-1">
//                         <p className="text-sm font-semibold text-yellow-800 mb-1">Cannot Vote</p>
//                         <p className="text-sm text-yellow-700">{votingStatus.reason}</p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Vote Button */}
//                   <button
//                     onClick={() => handleVoteClick(election)}
//                     disabled={!votingStatus.canVote}
//                     className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
//                       votingStatus.canVote
//                         ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     {votingStatus.icon}
//                     {votingStatus.buttonText}
//                     {votingStatus.canVote && <ArrowRight size={20} />}
//                   </button>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }