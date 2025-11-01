import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
import { getAllElections } from '../../../redux/api/election/electionApi';

export default function VoteNow() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  // ✅ FIXED: Fetch only once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchElections = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAllElections(1, 50, 'all');
        
        if (!isMounted) return;
        
        const allElections = response.data?.elections || response.elections || [];
        setElections(allElections);
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching elections:', error);
        setError(error.message || 'Failed to load elections');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchElections();

    return () => {
      isMounted = false;
    };
  }, []); // ✅ Empty dependency array - fetch only once

  // ✅ FIXED: Use useMemo to filter elections without refetching
  const filteredElections = useMemo(() => {
    const now = new Date();
    
    if (filter === 'active') {
      return elections.filter(election => {
        const startDate = new Date(election.start_date);
        const endDate = new Date(election.end_date);
        const isInDateRange = now.getTime() >= (startDate.getTime() - 60000) && now <= endDate;
        const isPublished = election.status === 'active' || election.status === 'published';
        return isInDateRange && isPublished;
      });
    } else if (filter === 'upcoming') {
      return elections.filter(election => {
        const startDate = new Date(election.start_date);
        return now.getTime() < (startDate.getTime() - 60000);
      });
    } else if (filter === 'ended') {
      return elections.filter(election => {
        const endDate = new Date(election.end_date);
        return now > endDate;
      });
    }
    
    return elections;
  }, [elections, filter]);

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

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllElections(1, 50, 'all');
      const allElections = response.data?.elections || response.elections || [];
      setElections(allElections);
      
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

  const handleVoteClick = (election) => {
    const votingStatus = getElectionVotingStatus(election);
    
    if (!votingStatus.canVote) {
      console.log('❌ Cannot vote:', votingStatus.reason);
      return;
    }
    
    console.log('✅ Voting allowed, navigating to election ID:', election.id);
    
    // ✅ Navigate to new detailed voting view
    navigate(`/elections/${election.id}/vote`);
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
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading elections...</p>
        </div>
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
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
          <p className="text-gray-600">Participate in elections</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          title="Refresh elections"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({elections.length})
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
        {filteredElections.length === 0 ? (
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
          filteredElections.map((election) => {
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
                      {election.description && (
                        <p className="text-gray-600 mb-4">{election.description}</p>
                      )}
                    </div>
                  </div>

                  {election.topic_image_url && (
                    <img 
                      src={election.topic_image_url} 
                      alt={election.title} 
                      className="w-full h-48 object-cover rounded-lg mb-4" 
                    />
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
                      <p className="font-medium">
                        {election.is_free ? 'Free' : (
                          election.pricing_type === 'regional_fee' 
                            ? 'Regional' 
                            : `$${election.general_participation_fee || '5.00'}`
                        )}
                      </p>
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
                          <p className="font-bold text-purple-900">
                            {election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || '100'}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-700">Winners</p>
                          <p className="font-bold text-purple-900">{election.lottery_config.winner_count || 1}</p>
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
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
// import { getAllElections } from '../../../redux/api/election/electionApi';

// export default function VoteNow() {
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);

//   // ✅ FIXED: Fetch only once on mount, not on every filter change
//   useEffect(() => {
//     let isMounted = true;

//     const fetchElections = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await getAllElections(1, 50, 'all');
        
//         if (!isMounted) return;
        
//         const allElections = response.data?.elections || response.elections || [];
//         setElections(allElections);
        
//       } catch (error) {
//         if (!isMounted) return;
        
//         console.error('Error fetching elections:', error);
//         setError(error.message || 'Failed to load elections');
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchElections();

//     // ✅ FIXED: Remove auto-refresh interval - only manual refresh
//     // If you want auto-refresh, uncomment below and set to longer interval (e.g., 5 minutes)
//     // const interval = setInterval(fetchElections, 300000); // 5 minutes
//     // return () => {
//     //   isMounted = false;
//     //   clearInterval(interval);
//     // };

//     return () => {
//       isMounted = false;
//     };
//   }, []); // ✅ Empty dependency array - fetch only once on mount

//   // ✅ FIXED: Use useMemo to filter elections without refetching
//   const filteredElections = useMemo(() => {
//     const now = new Date();
    
//     if (filter === 'active') {
//       return elections.filter(election => {
//         const startDate = new Date(election.start_date);
//         const endDate = new Date(election.end_date);
//         const isInDateRange = now.getTime() >= (startDate.getTime() - 60000) && now <= endDate;
//         const isPublished = election.status === 'active' || election.status === 'published';
//         return isInDateRange && isPublished;
//       });
//     } else if (filter === 'upcoming') {
//       return elections.filter(election => {
//         const startDate = new Date(election.start_date);
//         return now.getTime() < (startDate.getTime() - 60000);
//       });
//     } else if (filter === 'ended') {
//       return elections.filter(election => {
//         const endDate = new Date(election.end_date);
//         return now > endDate;
//       });
//     }
    
//     return elections; // 'all' filter
//   }, [elections, filter]); // Only recalculate when elections or filter changes

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

//   // ✅ Manual refresh function
//   const handleRefresh = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await getAllElections(1, 50, 'all');
//       const allElections = response.data?.elections || response.elections || [];
//       setElections(allElections);
      
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

//   const handleVoteClick = (election) => {
//     const votingStatus = getElectionVotingStatus(election);
    
//     if (!votingStatus.canVote) {
//       console.log('❌ Cannot vote:', votingStatus.reason);
//       return;
//     }
    
//     console.log('✅ Voting allowed, navigating to election ID:', election.id);
//     // navigate(`/vote/${election.id}`);
//     navigate(`/elections/${election.id}/vote`);
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
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading elections...</p>
//         </div>
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
//             onClick={handleRefresh}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
//           <p className="text-gray-600">Participate in elections</p>
//         </div>
//         {/* ✅ Manual refresh button */}
//         <button
//           onClick={handleRefresh}
//           className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
//           title="Refresh elections"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//           Refresh
//         </button>
//       </div>

//       {/* Filter Tabs */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex gap-2 flex-wrap">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             All ({elections.length})
//           </button>
//           <button
//             onClick={() => setFilter('active')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Active Now ({elections.filter(e => {
//               const now = new Date();
//               const start = new Date(e.start_date);
//               const end = new Date(e.end_date);
//               return now.getTime() >= (start.getTime() - 60000) && now <= end && (e.status === 'active' || e.status === 'published');
//             }).length})
//           </button>
//           <button
//             onClick={() => setFilter('upcoming')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Upcoming ({elections.filter(e => {
//               const now = new Date();
//               const start = new Date(e.start_date);
//               return now.getTime() < (start.getTime() - 60000);
//             }).length})
//           </button>
//           <button
//             onClick={() => setFilter('ended')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'ended' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Ended ({elections.filter(e => {
//               const now = new Date();
//               const end = new Date(e.end_date);
//               return now > end;
//             }).length})
//           </button>
//         </div>
//       </div>

//       {/* Elections List */}
//       <div className="space-y-4">
//         {filteredElections.length === 0 ? (
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
//           filteredElections.map((election) => {
//             const votingStatus = getElectionVotingStatus(election);
            
//             return (
//               <div key={election.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
//                 <div className="p-6">
//                   {/* Header Section */}
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
//                       {election.description && (
//                         <p className="text-gray-600 mb-4">{election.description}</p>
//                       )}
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

//                   {/* Election Details Grid */}
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
//                         {election.is_free ? 'Free' : (
//                           election.pricing_type === 'regional_fee' 
//                             ? 'Regional' 
//                             : `$${election.general_participation_fee || '5.00'}`
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Lottery Information */}
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
//                             {election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || '100'}`}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-purple-700">Winners</p>
//                           <p className="font-bold text-purple-900">{election.lottery_config.winner_count || 1}</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Voting Status Message */}
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
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Loader, Vote, Calendar, DollarSign, Users, ArrowRight, AlertCircle, Lock, Clock } from 'lucide-react';
// import { getAllElections } from '../../../redux/api/election/electionApi';

// export default function VoteNow() {
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);

//   // ✅ FIXED: Fetch only once on mount, not on every filter change
//   useEffect(() => {
//     let isMounted = true;

//     const fetchElections = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await getAllElections(1, 50, 'all');
        
//         if (!isMounted) return;
        
//         const allElections = response.data?.elections || response.elections || [];
//         setElections(allElections);
        
//       } catch (error) {
//         if (!isMounted) return;
        
//         console.error('Error fetching elections:', error);
//         setError(error.message || 'Failed to load elections');
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchElections();

//     // ✅ FIXED: Remove auto-refresh interval - only manual refresh
//     // If you want auto-refresh, uncomment below and set to longer interval (e.g., 5 minutes)
//     // const interval = setInterval(fetchElections, 300000); // 5 minutes
//     // return () => {
//     //   isMounted = false;
//     //   clearInterval(interval);
//     // };

//     return () => {
//       isMounted = false;
//     };
//   }, []); // ✅ Empty dependency array - fetch only once on mount

//   // ✅ FIXED: Use useMemo to filter elections without refetching
//   const filteredElections = useMemo(() => {
//     const now = new Date();
    
//     if (filter === 'active') {
//       return elections.filter(election => {
//         const startDate = new Date(election.start_date);
//         const endDate = new Date(election.end_date);
//         const isInDateRange = now.getTime() >= (startDate.getTime() - 60000) && now <= endDate;
//         const isPublished = election.status === 'active' || election.status === 'published';
//         return isInDateRange && isPublished;
//       });
//     } else if (filter === 'upcoming') {
//       return elections.filter(election => {
//         const startDate = new Date(election.start_date);
//         return now.getTime() < (startDate.getTime() - 60000);
//       });
//     } else if (filter === 'ended') {
//       return elections.filter(election => {
//         const endDate = new Date(election.end_date);
//         return now > endDate;
//       });
//     }
    
//     return elections; // 'all' filter
//   }, [elections, filter]); // Only recalculate when elections or filter changes

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

//   // ✅ Manual refresh function
//   const handleRefresh = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await getAllElections(1, 50, 'all');
//       const allElections = response.data?.elections || response.elections || [];
//       setElections(allElections);
      
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

//   const handleVoteClick = (election) => {
//     const votingStatus = getElectionVotingStatus(election);
    
//     if (!votingStatus.canVote) {
//       console.log('❌ Cannot vote:', votingStatus.reason);
//       return;
//     }
    
//     console.log('✅ Voting allowed, navigating to election ID:', election.id);
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
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading elections...</p>
//         </div>
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
//             onClick={handleRefresh}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Vote Now</h1>
//           <p className="text-gray-600">Participate in elections</p>
//         </div>
//         {/* ✅ Manual refresh button */}
//         <button
//           onClick={handleRefresh}
//           className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
//           title="Refresh elections"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//           Refresh
//         </button>
//       </div>

//       {/* Filter Tabs */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <div className="flex gap-2 flex-wrap">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             All ({elections.length})
//           </button>
//           <button
//             onClick={() => setFilter('active')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Active Now ({elections.filter(e => {
//               const now = new Date();
//               const start = new Date(e.start_date);
//               const end = new Date(e.end_date);
//               return now.getTime() >= (start.getTime() - 60000) && now <= end && (e.status === 'active' || e.status === 'published');
//             }).length})
//           </button>
//           <button
//             onClick={() => setFilter('upcoming')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Upcoming ({elections.filter(e => {
//               const now = new Date();
//               const start = new Date(e.start_date);
//               return now.getTime() < (start.getTime() - 60000);
//             }).length})
//           </button>
//           <button
//             onClick={() => setFilter('ended')}
//             className={`px-4 py-2 rounded-lg transition ${
//               filter === 'ended' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Ended ({elections.filter(e => {
//               const now = new Date();
//               const end = new Date(e.end_date);
//               return now > end;
//             }).length})
//           </button>
//         </div>
//       </div>

//       {/* Elections List */}
//       <div className="space-y-4">
//         {filteredElections.length === 0 ? (
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
//           filteredElections.map((election) => {
//             const votingStatus = getElectionVotingStatus(election);
            
//             return (
//               <div key={election.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
//                 <div className="p-6">
//                   {/* Header Section */}
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
//                       {election.description && (
//                         <p className="text-gray-600 mb-4">{election.description}</p>
//                       )}
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

//                   {/* Election Details Grid */}
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
//                         {election.is_free ? 'Free' : (
//                           election.pricing_type === 'regional_fee' 
//                             ? 'Regional' 
//                             : `$${election.general_participation_fee || '5.00'}`
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Lottery Information */}
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
//                             {election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || '100'}`}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-purple-700">Winners</p>
//                           <p className="font-bold text-purple-900">{election.lottery_config.winner_count || 1}</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Voting Status Message */}
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
