// src/pages/superAdmin/ElectionStatsPage.jsx - FIXED VERSION
/**
 * FIXED: Proper detection of draw status and prize distribution
 * - Now checks winners array from API response
 * - Adds winner details with names in modal
 * - Fixed API response structure handling
 */
import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Calendar, Play, X, TrendingUp, Loader, Trophy, User, DollarSign } from 'lucide-react';
import { getAllElections } from '../../redux/api/election/electionApi';
import { useDrawLotteryMutation } from '../../redux/api/lotteryyy/lotteryDrawApi';
import { toast } from 'react-toastify';

export default function ElectionStatsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [enrichedElections, setEnrichedElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [triggerDraw, { isLoading: drawLoading }] = useDrawLotteryMutation();

  // ✅ Fetch ALL elections using axios
  useEffect(() => {
    const fetchAllElections = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getAllElections(1, 100, 'all');
        console.log('📊 getAllElections response:', response);
        
        const elections = response.data?.elections || response.elections || [];
        console.log('📊 Total elections:', elections.length);
        
        // Fetch lottery data for each
        const enrichedData = await Promise.all(
          elections.map(async (election) => {
            const electionId = election.election_id || election.id;
            
            if (!electionId) return null;

            try {
              const res = await fetch(
                `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/lottery/elections/${electionId}/lottery`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'x-user-data': localStorage.getItem('userData') || '{}',
                  }
                }
              );

              let lotteryData = {};
              if (res.ok) {
                const data = await res.json();
                // ✅ FIX: Handle both nested and flat response structures
                lotteryData = data.data || data;
                console.log(`🎰 Lottery data for election ${electionId}:`, lotteryData);
              }

              const now = new Date();
              const drawDate = election.lottery_draw_date ? new Date(election.lottery_draw_date) : null;
              
              // ✅ FIX: Get winners array - check all possible locations
              const winners = lotteryData.winners || [];
              
              // ✅ FIX: Multiple checks for draw completion
              const hasBeenDrawn = 
                lotteryData.has_been_drawn === true || 
                lotteryData.hasBeenDrawn === true ||
                lotteryData.lottery_enabled === false || // Not a typo - if lottery disabled after creation
                winners.length > 0; // Most reliable indicator
              
              let drawStatus = 'pending';
              if (hasBeenDrawn) {
                drawStatus = 'completed';
              } else if (election.lottery_enabled && drawDate && now > drawDate) {
                drawStatus = 'failed';
              }

              // ✅ FIX: Prizes are distributed when winners exist (auto-credited to wallets)
              const prizesDistributed = winners.length > 0;

              console.log(`📊 Election ${electionId}:`, {
                drawStatus,
                hasBeenDrawn,
                winnersCount: winners.length,
                prizesDistributed,
                lotteryEnabled: election.lottery_enabled
              });

              return {
                id: electionId,
                title: election.title || 'Untitled Election',
                startDate: election.start_date,
                endDate: election.end_date,
                drawDate: election.lottery_draw_date,
                status: election.status || 'draft',
                totalVotes: parseInt(lotteryData.participant_count || lotteryData.participantCount || 0),
                prizePool: parseFloat(lotteryData.total_prize_pool || lotteryData.totalPrizePool || 0),
                winnersCount: parseInt(lotteryData.winner_count || lotteryData.winnerCount || winners.length || 0),
                drawStatus: drawStatus,
                prizesDistributed: prizesDistributed,
                lotteryEnabled: election.lottery_enabled === true,
                rewardType: lotteryData.reward_type || lotteryData.rewardType,
                winners: winners, // ✅ Store winners for details modal
              };
            } catch (error) {
              console.error(`Error fetching lottery for ${electionId}:`, error);
              return {
                id: electionId,
                title: election.title || 'Untitled Election',
                startDate: election.start_date,
                endDate: election.end_date,
                drawDate: election.lottery_draw_date,
                status: election.status || 'draft',
                totalVotes: 0,
                prizePool: 0,
                winnersCount: 0,
                drawStatus: 'pending',
                prizesDistributed: false,
                lotteryEnabled: election.lottery_enabled === true,
                winners: [],
              };
            }
          })
        );

        setEnrichedElections(enrichedData.filter(e => e !== null));
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllElections();
  }, []);

  const refetch = async () => {
    setEnrichedElections([]);
    setIsLoading(true);
    try {
        /*eslint-disable*/
      const response = await getAllElections(1, 100, 'all');
      // Process again...
      window.location.reload();
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const filteredElections = useMemo(() => {
    return enrichedElections.filter(e => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'draft' && e.status !== 'draft') return false;
        if (filterStatus === 'active' && e.status !== 'active') return false;
        if (filterStatus === 'ended' && e.status !== 'ended') return false;
        if (filterStatus === 'completed' && e.status !== 'completed') return false;
        if (filterStatus === 'failed' && e.drawStatus !== 'failed') return false;
      }
      
      if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !e.id.toString().includes(searchTerm)) {
        return false;
      }
      
      return true;
    });
  }, [enrichedElections, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const totalPrize = enrichedElections.reduce((sum, e) => sum + (parseFloat(e.prizePool) || 0), 0);
    const totalVotes = enrichedElections.reduce((sum, e) => sum + (parseInt(e.totalVotes) || 0), 0);

    return {
      totalElections: enrichedElections.length,
      activeElections: enrichedElections.filter(e => e.status === 'active').length,
      totalPrizePool: totalPrize,
      totalVotes: totalVotes,
      failedDraws: enrichedElections.filter(e => e.drawStatus === 'failed').length,
    };
  }, [enrichedElections]);

  const filterCounts = useMemo(() => ({
    all: enrichedElections.length,
    draft: enrichedElections.filter(e => e.status === 'draft').length,
    active: enrichedElections.filter(e => e.status === 'active').length,
    ended: enrichedElections.filter(e => e.status === 'ended').length,
    completed: enrichedElections.filter(e => e.status === 'completed').length,
    failed: enrichedElections.filter(e => e.drawStatus === 'failed').length,
  }), [enrichedElections]);

  const handleManualDraw = async (electionId) => {
    if (drawLoading) return;
    if (!confirm('Are you sure you want to trigger a manual lottery draw?')) return;
    
    try {
      await triggerDraw(electionId).unwrap();
      toast.success('Lottery draw completed successfully!');
      refetch();
    } catch (error) {
      console.error('Manual draw error:', error);
      toast.error(error?.data?.message || 'Failed to trigger lottery draw');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getDaysUntilDraw = (drawDate) => {
    if (!drawDate) return null;
    try {
      const now = new Date();
      const draw = new Date(drawDate);
      const diff = Math.ceil((draw - now) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Election Statistics & Monitoring
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 font-semibold mb-2">Error Loading Elections</p>
          <p className="text-sm text-red-600">{error?.message || 'Failed to load elections'}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Election Statistics & Monitoring
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading all elections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          Election Statistics & Monitoring
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Failed Draws</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedDraws}</p>
              <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Elections</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalElections}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.activeElections} active | {stats.totalVotes} total votes</p>
            </div>
            <Clock className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Prize Pool</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${(stats.totalPrizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
              </p>
              <p className="text-xs text-green-600 mt-1">Across all elections</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
        <div className="flex flex-wrap gap-2">
          {[
            {id:'all', label:'All Elections', count: filterCounts.all},
            {id:'draft', label:'Draft', count: filterCounts.draft},
            {id:'active', label:'Active', count: filterCounts.active},
            {id:'ended', label:'Ended', count: filterCounts.ended},
            {id:'completed', label:'Completed', count: filterCounts.completed},
            {id:'failed', label:'Failed Draws', count: filterCounts.failed},
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                filterStatus === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search by name, election ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <p className="text-sm text-gray-600">Showing {filteredElections.length} result{filteredElections.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <Clock className="inline w-4 h-4 mr-1" />Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredElections.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No Elections Found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm ? 'Try adjusting your search' : 'No elections available'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredElections.map(e => {
                  const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                  
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar size={12} />Start: {formatDate(e.startDate)}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar size={12} />End: {formatDate(e.endDate)}
                          </div>
                          
                          {(() => {
                            const now = new Date();
                            const endDate = e.endDate ? new Date(e.endDate) : null;
                            const startDate = e.startDate ? new Date(e.startDate) : null;
                            
                            if (endDate && now > endDate) {
                              const daysAgo = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
                              return (
                                <div className="flex items-center gap-1 font-medium text-gray-700">
                                  <CheckCircle size={12} />
                                  Ended {daysAgo > 0 ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago` : 'today'}
                                </div>
                              );
                            } else if (startDate && now < startDate) {
                              const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                              return (
                                <div className="flex items-center gap-1 font-medium text-blue-600">
                                  <Clock size={12} />
                                  Starts in {daysUntil} day{daysUntil > 1 ? 's' : ''}
                                </div>
                              );
                            } else if (endDate) {
                              const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                              return (
                                <div className="flex items-center gap-1 font-medium text-green-600">
                                  <TrendingUp size={12} />
                                  {daysRemaining > 0 
                                    ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` 
                                    : 'Ends today'}
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
                          {e.lotteryEnabled && e.drawDate && (
                            <>
                              <div className="flex items-center gap-1 font-medium text-purple-600 pt-1 border-t border-gray-200 mt-1">
                                <Calendar size={12} />Draw: {formatDate(e.drawDate)}
                              </div>
                              {(() => {
                                const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                                if (daysUntilDraw !== null && daysUntilDraw > 0) {
                                  return (
                                    <div className="text-xs text-purple-600">
                                      Draw in {daysUntilDraw} day{daysUntilDraw > 1 ? 's' : ''}
                                    </div>
                                  );
                                } else if (daysUntilDraw !== null && daysUntilDraw < 0) {
                                  return (
                                    <div className="text-xs text-orange-600">
                                      Draw was {Math.abs(daysUntilDraw)} day{Math.abs(daysUntilDraw) > 1 ? 's' : ''} ago
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{e.title}</div>
                        <div className="text-xs text-gray-500">ID: #{e.id}</div>
                        <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
                          e.status==='active'?'bg-green-100 text-green-800':
                          e.status==='completed'?'bg-blue-100 text-blue-800':
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div>Votes: <span className="font-semibold">{e.totalVotes > 0 ? e.totalVotes : '0 (No votes yet)'}</span></div>
                          {e.lotteryEnabled && (
                            <>
                              <div>Prize: <span className="font-semibold text-green-600">
                                ${(e.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                              </span></div>
                              <div>Winners: <span className="font-semibold">{e.winnersCount > 0 ? e.winnersCount : 'TBD'}</span></div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {e.lotteryEnabled ? (
                          <div className="space-y-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              e.drawStatus==='pending'?'bg-yellow-100 text-yellow-800':
                              e.drawStatus==='completed'?'bg-green-100 text-green-800':
                              'bg-red-100 text-red-800'
                            }`}>
                              {e.drawStatus==='pending'&&<Clock size={14}/>}
                              {e.drawStatus==='completed'&&<CheckCircle size={14}/>}
                              {e.drawStatus==='failed'&&<AlertTriangle size={14}/>}
                              {e.drawStatus}
                            </span>
                            {e.drawStatus==='failed'&&(
                              <button
                                onClick={() => handleManualDraw(e.id)}
                                disabled={drawLoading}
                                className="w-full mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {drawLoading ? <Loader className="animate-spin" size={12} /> : <Play size={12}/>}
                                Manual Draw
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No lottery</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {e.lotteryEnabled ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            e.prizesDistributed?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'
                          }`}>
                            {e.prizesDistributed?<CheckCircle size={14}/>:<Clock size={14}/>}
                            {e.prizesDistributed?'Distributed':'Pending'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedElection(e)}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ ENHANCED Modal with Winner Details */}
      {selectedElection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedElection.title}</h2>
                <p className="text-sm text-gray-600 mt-1">Election ID: #{selectedElection.id}</p>
              </div>
              <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.status}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Total Votes</p>
                  <p className="text-sm font-semibold mt-1">{selectedElection.totalVotes}</p>
                </div>
                {selectedElection.lotteryEnabled && (
                  <>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Prize Pool</p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        ${(selectedElection.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Draw Status</p>
                      <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.drawStatus}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Reward Type</p>
                      <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.rewardType?.replace('_', ' ') || 'Monetary'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Winners</p>
                      <p className="text-sm font-semibold mt-1">{selectedElection.winnersCount}</p>
                    </div>
                  </>
                )}
              </div>

              {/* ✅ Winners List */}
              {selectedElection.lotteryEnabled && selectedElection.winners && selectedElection.winners.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Lottery Winners ({selectedElection.winners.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {selectedElection.winners.map((winner, idx) => (
                      <div 
                        key={winner.winner_id || idx} 
                        className={`p-4 hover:bg-gray-50 transition ${
                          idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Rank Badge */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              winner.rank === 1 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' :
                              winner.rank === 2 ? 'bg-gray-200 text-gray-700 border-2 border-gray-400' :
                              winner.rank === 3 ? 'bg-orange-100 text-orange-700 border-2 border-orange-400' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              #{winner.rank}
                            </div>
                            
                            {/* Winner Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <p className="font-semibold text-gray-900">
                                  {winner.winner_name || winner.full_name || `User #${winner.user_id}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600">User ID: {winner.user_id}</span>
                                {winner.ball_number && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                    Ball #{winner.ball_number}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Prize Info */}
                          <div className="text-right">
                            {winner.prize_type === 'monetary' ? (
                              <>
                                <div className="flex items-center gap-1 justify-end">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <p className="text-lg font-bold text-green-600">
                                    ${parseFloat(winner.prize_amount || 0).toFixed(2)}
                                  </p>
                                </div>
                                {winner.prize_percentage && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {parseFloat(winner.prize_percentage).toFixed(1)}% of pool
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm font-medium text-purple-600">
                                {winner.prize_description || 'Non-monetary prize'}
                              </p>
                            )}
                            
                            {/* Claim Status */}
                            <div className="mt-2">
                              {winner.claimed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle size={12} />
                                  Claimed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                  <Clock size={12} />
                                  Auto-Credited
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Winners Message */}
              {selectedElection.lotteryEnabled && (!selectedElection.winners || selectedElection.winners.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800 font-medium">No Winners Yet</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {selectedElection.drawStatus === 'pending' 
                      ? 'Lottery draw has not been conducted yet' 
                      : 'No participants in this lottery'}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedElection.drawStatus === 'failed' && (
                  <button
                    onClick={() => {
                      handleManualDraw(selectedElection.id);
                      setSelectedElection(null);
                    }}
                    disabled={drawLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {drawLoading ? <Loader className="animate-spin" size={18} /> : <Play size={18}/>}
                    Trigger Manual Draw
                  </button>
                )}
                <button 
                  onClick={() => setSelectedElection(null)} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-semibold">Showing All System Elections</p>
            <p className="text-sm text-blue-700 mt-1">
              Elections from all creators • Lottery stats from Voting Service • Winners detected automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// // src/pages/superAdmin/ElectionStatsPage.jsx - FIXED VERSION
// /**
//  * FIXED: Proper detection of draw status and prize distribution
//  * - Now checks winners array from API response
//  * - Adds winner details with names in modal
//  * - Fixed API response structure handling
//  */
// import React, { useState, useMemo, useEffect } from 'react';
// import { AlertTriangle, CheckCircle, Clock, Calendar, Play, X, TrendingUp, Loader, Trophy, User, DollarSign } from 'lucide-react';
// import { getAllElections } from '../../redux/api/election/electionApi';
// import { useDrawLotteryMutation } from '../../redux/api/lotteryyy/lotteryDrawApi';
// import { toast } from 'react-toastify';

// export default function ElectionStatsPage() {
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [enrichedElections, setEnrichedElections] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [triggerDraw, { isLoading: drawLoading }] = useDrawLotteryMutation();

//   // ✅ Fetch ALL elections using axios
//   useEffect(() => {
//     const fetchAllElections = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const response = await getAllElections(1, 100, 'all');
//         console.log('📊 getAllElections response:', response);
        
//         const elections = response.data?.elections || response.elections || [];
//         console.log('📊 Total elections:', elections.length);
        
//         // Fetch lottery data for each
//         const enrichedData = await Promise.all(
//           elections.map(async (election) => {
//             const electionId = election.election_id || election.id;
            
//             if (!electionId) return null;

//             try {
//               const res = await fetch(
//                 `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/lottery/elections/${electionId}/lottery`,
//                 {
//                   headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                     'x-user-data': localStorage.getItem('userData') || '{}',
//                   }
//                 }
//               );

//               let lotteryData = {};
//               if (res.ok) {
//                 const data = await res.json();
//                 // ✅ FIX: Handle both nested and flat response structures
//                 lotteryData = data.data || data;
//                 console.log(`🎰 Lottery data for election ${electionId}:`, lotteryData);
//               }

//               const now = new Date();
//               const drawDate = election.lottery_draw_date ? new Date(election.lottery_draw_date) : null;
              
//               // ✅ FIX: Get winners array - check all possible locations
//               const winners = lotteryData.winners || [];
              
//               // ✅ FIX: Multiple checks for draw completion
//               const hasBeenDrawn = 
//                 lotteryData.has_been_drawn === true || 
//                 lotteryData.hasBeenDrawn === true ||
//                 lotteryData.lottery_enabled === false || // Not a typo - if lottery disabled after creation
//                 winners.length > 0; // Most reliable indicator
              
//               let drawStatus = 'pending';
//               if (hasBeenDrawn) {
//                 drawStatus = 'completed';
//               } else if (election.lottery_enabled && drawDate && now > drawDate) {
//                 drawStatus = 'failed';
//               }

//               // ✅ FIX: Prizes are distributed when winners exist (auto-credited to wallets)
//               const prizesDistributed = winners.length > 0;

//               console.log(`📊 Election ${electionId}:`, {
//                 drawStatus,
//                 hasBeenDrawn,
//                 winnersCount: winners.length,
//                 prizesDistributed,
//                 lotteryEnabled: election.lottery_enabled
//               });

//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: parseInt(lotteryData.participant_count || lotteryData.participantCount || 0),
//                 prizePool: parseFloat(lotteryData.total_prize_pool || lotteryData.totalPrizePool || 0),
//                 winnersCount: parseInt(lotteryData.winner_count || lotteryData.winnerCount || winners.length || 0),
//                 drawStatus: drawStatus,
//                 prizesDistributed: prizesDistributed,
//                 lotteryEnabled: election.lottery_enabled === true,
//                 rewardType: lotteryData.reward_type || lotteryData.rewardType,
//                 winners: winners, // ✅ Store winners for details modal
//               };
//             } catch (error) {
//               console.error(`Error fetching lottery for ${electionId}:`, error);
//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: 0,
//                 prizePool: 0,
//                 winnersCount: 0,
//                 drawStatus: 'pending',
//                 prizesDistributed: false,
//                 lotteryEnabled: election.lottery_enabled === true,
//                 winners: [],
//               };
//             }
//           })
//         );

//         setEnrichedElections(enrichedData.filter(e => e !== null));
//       } catch (err) {
//         console.error('Error fetching elections:', err);
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllElections();
//   }, []);

//   const refetch = async () => {
//     setEnrichedElections([]);
//     setIsLoading(true);
//     try {
//         /*eslint-disable*/
//       const response = await getAllElections(1, 100, 'all');
//       // Process again...
//       window.location.reload();
//     } catch (err) {
//       setError(err);
//       setIsLoading(false);
//     }
//   };

//   const filteredElections = useMemo(() => {
//     return enrichedElections.filter(e => {
//       if (filterStatus !== 'all') {
//         if (filterStatus === 'draft' && e.status !== 'draft') return false;
//         if (filterStatus === 'active' && e.status !== 'active') return false;
//         if (filterStatus === 'ended' && e.status !== 'ended') return false;
//         if (filterStatus === 'completed' && e.status !== 'completed') return false;
//         if (filterStatus === 'failed' && e.drawStatus !== 'failed') return false;
//       }
      
//       if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !e.id.toString().includes(searchTerm)) {
//         return false;
//       }
      
//       return true;
//     });
//   }, [enrichedElections, searchTerm, filterStatus]);

//   const stats = useMemo(() => {
//     const totalPrize = enrichedElections.reduce((sum, e) => sum + (parseFloat(e.prizePool) || 0), 0);
//     const totalVotes = enrichedElections.reduce((sum, e) => sum + (parseInt(e.totalVotes) || 0), 0);

//     return {
//       totalElections: enrichedElections.length,
//       activeElections: enrichedElections.filter(e => e.status === 'active').length,
//       totalPrizePool: totalPrize,
//       totalVotes: totalVotes,
//       failedDraws: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//     };
//   }, [enrichedElections]);

//   const filterCounts = useMemo(() => ({
//     all: enrichedElections.length,
//     draft: enrichedElections.filter(e => e.status === 'draft').length,
//     active: enrichedElections.filter(e => e.status === 'active').length,
//     ended: enrichedElections.filter(e => e.status === 'ended').length,
//     completed: enrichedElections.filter(e => e.status === 'completed').length,
//     failed: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//   }), [enrichedElections]);

//   const handleManualDraw = async (electionId) => {
//     if (drawLoading) return;
//     if (!confirm('Are you sure you want to trigger a manual lottery draw?')) return;
    
//     try {
//       await triggerDraw(electionId).unwrap();
//       toast.success('Lottery draw completed successfully!');
//       refetch();
//     } catch (error) {
//       console.error('Manual draw error:', error);
//       toast.error(error?.data?.message || 'Failed to trigger lottery draw');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const getDaysUntilDraw = (drawDate) => {
//     if (!drawDate) return null;
//     try {
//       const now = new Date();
//       const draw = new Date(drawDate);
//       const diff = Math.ceil((draw - now) / (1000 * 60 * 60 * 24));
//       return diff;
//     } catch {
//       return null;
//     }
//   };

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//           <p className="text-red-800 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-sm text-red-600">{error?.message || 'Failed to load elections'}</p>
//           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//             <p className="text-gray-600">Loading all elections...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <TrendingUp className="w-8 h-8 text-purple-600" />
//           Election Statistics & Monitoring
//         </h1>
//         <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Failed Draws</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedDraws}</p>
//               <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Elections</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalElections}</p>
//               <p className="text-xs text-blue-600 mt-1">{stats.activeElections} active | {stats.totalVotes} total votes</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Total Prize Pool</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">
//                 ${(stats.totalPrizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//               </p>
//               <p className="text-xs text-green-600 mt-1">Across all elections</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
//         <div className="flex flex-wrap gap-2">
//           {[
//             {id:'all', label:'All Elections', count: filterCounts.all},
//             {id:'draft', label:'Draft', count: filterCounts.draft},
//             {id:'active', label:'Active', count: filterCounts.active},
//             {id:'ended', label:'Ended', count: filterCounts.ended},
//             {id:'completed', label:'Completed', count: filterCounts.completed},
//             {id:'failed', label:'Failed Draws', count: filterCounts.failed},
//           ].map(f => (
//             <button
//               key={f.id}
//               onClick={() => setFilterStatus(f.id)}
//               className={`px-3 py-1.5 rounded text-sm font-medium transition ${
//                 filterStatus === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {f.label} ({f.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <input
//           type="text"
//           placeholder="Search by name, election ID..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       <p className="text-sm text-gray-600">Showing {filteredElections.length} result{filteredElections.length !== 1 ? 's' : ''}</p>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Clock className="inline w-4 h-4 mr-1" />Timeline
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredElections.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center">
//                     <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600 font-medium">No Elections Found</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {searchTerm ? 'Try adjusting your search' : 'No elections available'}
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredElections.map(e => {
//                   const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                  
//                   return (
//                     <tr key={e.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-xs space-y-1">
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />Start: {formatDate(e.startDate)}
//                           </div>
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />End: {formatDate(e.endDate)}
//                           </div>
                          
//                           {(() => {
//                             const now = new Date();
//                             const endDate = e.endDate ? new Date(e.endDate) : null;
//                             const startDate = e.startDate ? new Date(e.startDate) : null;
                            
//                             if (endDate && now > endDate) {
//                               const daysAgo = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-gray-700">
//                                   <CheckCircle size={12} />
//                                   Ended {daysAgo > 0 ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago` : 'today'}
//                                 </div>
//                               );
//                             } else if (startDate && now < startDate) {
//                               const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-blue-600">
//                                   <Clock size={12} />
//                                   Starts in {daysUntil} day{daysUntil > 1 ? 's' : ''}
//                                 </div>
//                               );
//                             } else if (endDate) {
//                               const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-green-600">
//                                   <TrendingUp size={12} />
//                                   {daysRemaining > 0 
//                                     ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` 
//                                     : 'Ends today'}
//                                 </div>
//                               );
//                             }
//                             return null;
//                           })()}
                          
//                           {e.lotteryEnabled && e.drawDate && (
//                             <>
//                               <div className="flex items-center gap-1 font-medium text-purple-600 pt-1 border-t border-gray-200 mt-1">
//                                 <Calendar size={12} />Draw: {formatDate(e.drawDate)}
//                               </div>
//                               {(() => {
//                                 const daysUntilDraw = getDaysUntilDraw(e.drawDate);
//                                 if (daysUntilDraw !== null && daysUntilDraw > 0) {
//                                   return (
//                                     <div className="text-xs text-purple-600">
//                                       Draw in {daysUntilDraw} day{daysUntilDraw > 1 ? 's' : ''}
//                                     </div>
//                                   );
//                                 } else if (daysUntilDraw !== null && daysUntilDraw < 0) {
//                                   return (
//                                     <div className="text-xs text-orange-600">
//                                       Draw was {Math.abs(daysUntilDraw)} day{Math.abs(daysUntilDraw) > 1 ? 's' : ''} ago
//                                     </div>
//                                   );
//                                 }
//                                 return null;
//                               })()}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{e.title}</div>
//                         <div className="text-xs text-gray-500">ID: #{e.id}</div>
//                         <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
//                           e.status==='active'?'bg-green-100 text-green-800':
//                           e.status==='completed'?'bg-blue-100 text-blue-800':
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {e.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-xs space-y-1">
//                           <div>Votes: <span className="font-semibold">{e.totalVotes > 0 ? e.totalVotes : '0 (No votes yet)'}</span></div>
//                           {e.lotteryEnabled && (
//                             <>
//                               <div>Prize: <span className="font-semibold text-green-600">
//                                 ${(e.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                               </span></div>
//                               <div>Winners: <span className="font-semibold">{e.winnersCount > 0 ? e.winnersCount : 'TBD'}</span></div>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <div className="space-y-2">
//                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                               e.drawStatus==='pending'?'bg-yellow-100 text-yellow-800':
//                               e.drawStatus==='completed'?'bg-green-100 text-green-800':
//                               'bg-red-100 text-red-800'
//                             }`}>
//                               {e.drawStatus==='pending'&&<Clock size={14}/>}
//                               {e.drawStatus==='completed'&&<CheckCircle size={14}/>}
//                               {e.drawStatus==='failed'&&<AlertTriangle size={14}/>}
//                               {e.drawStatus}
//                             </span>
//                             {e.drawStatus==='failed'&&(
//                               <button
//                                 onClick={() => handleManualDraw(e.id)}
//                                 disabled={drawLoading}
//                                 className="w-full mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
//                               >
//                                 {drawLoading ? <Loader className="animate-spin" size={12} /> : <Play size={12}/>}
//                                 Manual Draw
//                               </button>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-gray-500">No lottery</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                             e.prizesDistributed?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {e.prizesDistributed?<CheckCircle size={14}/>:<Clock size={14}/>}
//                             {e.prizesDistributed?'Distributed':'Pending'}
//                           </span>
//                         ) : (
//                           <span className="text-xs text-gray-500">N/A</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setSelectedElection(e)}
//                           className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-medium"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ✅ ENHANCED Modal with Winner Details */}
//       {selectedElection && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">{selectedElection.title}</h2>
//                 <p className="text-sm text-gray-600 mt-1">Election ID: #{selectedElection.id}</p>
//               </div>
//               <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24}/>
//               </button>
//             </div>
            
//             <div className="p-6 space-y-6">
//               {/* Stats Grid */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Status</p>
//                   <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.status}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Total Votes</p>
//                   <p className="text-sm font-semibold mt-1">{selectedElection.totalVotes}</p>
//                 </div>
//                 {selectedElection.lotteryEnabled && (
//                   <>
//                     <div className="bg-green-50 p-3 rounded border border-green-200">
//                       <p className="text-xs text-gray-600">Prize Pool</p>
//                       <p className="text-sm font-semibold text-green-600 mt-1">
//                         ${(selectedElection.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Draw Status</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.drawStatus}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Reward Type</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.rewardType?.replace('_', ' ') || 'Monetary'}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Winners</p>
//                       <p className="text-sm font-semibold mt-1">{selectedElection.winnersCount}</p>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* ✅ Winners List */}
//               {selectedElection.lotteryEnabled && selectedElection.winners && selectedElection.winners.length > 0 && (
//                 <div className="border border-gray-200 rounded-lg overflow-hidden">
//                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
//                     <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
//                       <Trophy className="w-5 h-5 text-yellow-600" />
//                       Lottery Winners ({selectedElection.winners.length})
//                     </h3>
//                   </div>
//                   <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
//                     {selectedElection.winners.map((winner, idx) => (
//                       <div 
//                         key={winner.winner_id || idx} 
//                         className={`p-4 hover:bg-gray-50 transition ${
//                           idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-50' : ''
//                         }`}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             {/* Rank Badge */}
//                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
//                               winner.rank === 1 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' :
//                               winner.rank === 2 ? 'bg-gray-200 text-gray-700 border-2 border-gray-400' :
//                               winner.rank === 3 ? 'bg-orange-100 text-orange-700 border-2 border-orange-400' :
//                               'bg-purple-100 text-purple-700'
//                             }`}>
//                               #{winner.rank}
//                             </div>
                            
//                             {/* Winner Info */}
//                             <div>
//                               <div className="flex items-center gap-2">
//                                 <User className="w-4 h-4 text-gray-500" />
//                                 <p className="font-semibold text-gray-900">
//                                   {winner.winner_name || winner.full_name || `User #${winner.user_id}`}
//                                 </p>
//                               </div>
//                               {winner.username && (
//                                 <p className="text-xs text-gray-500 mt-0.5">@{winner.username}</p>
//                               )}
//                               <div className="flex items-center gap-2 mt-1">
//                                 <span className="text-xs text-gray-600">User ID: {winner.user_id}</span>
//                                 {winner.ball_number && (
//                                   <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
//                                     Ball #{winner.ball_number}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           {/* Prize Info */}
//                           <div className="text-right">
//                             {winner.prize_type === 'monetary' ? (
//                               <>
//                                 <div className="flex items-center gap-1 justify-end">
//                                   <DollarSign className="w-4 h-4 text-green-600" />
//                                   <p className="text-lg font-bold text-green-600">
//                                     ${parseFloat(winner.prize_amount || 0).toFixed(2)}
//                                   </p>
//                                 </div>
//                                 {winner.prize_percentage && (
//                                   <p className="text-xs text-gray-500 mt-0.5">
//                                     {parseFloat(winner.prize_percentage).toFixed(1)}% of pool
//                                   </p>
//                                 )}
//                               </>
//                             ) : (
//                               <p className="text-sm font-medium text-purple-600">
//                                 {winner.prize_description || 'Non-monetary prize'}
//                               </p>
//                             )}
                            
//                             {/* Claim Status */}
//                             <div className="mt-2">
//                               {winner.claimed ? (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
//                                   <CheckCircle size={12} />
//                                   Claimed
//                                 </span>
//                               ) : (
//                                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
//                                   <Clock size={12} />
//                                   Auto-Credited
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* No Winners Message */}
//               {selectedElection.lotteryEnabled && (!selectedElection.winners || selectedElection.winners.length === 0) && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
//                   <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
//                   <p className="text-sm text-yellow-800 font-medium">No Winners Yet</p>
//                   <p className="text-xs text-yellow-700 mt-1">
//                     {selectedElection.drawStatus === 'pending' 
//                       ? 'Lottery draw has not been conducted yet' 
//                       : 'No participants in this lottery'}
//                   </p>
//                 </div>
//               )}
              
//               {/* Action Buttons */}
//               <div className="flex gap-3 pt-4 border-t border-gray-200">
//                 {selectedElection.drawStatus === 'failed' && (
//                   <button
//                     onClick={() => {
//                       handleManualDraw(selectedElection.id);
//                       setSelectedElection(null);
//                     }}
//                     disabled={drawLoading}
//                     className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {drawLoading ? <Loader className="animate-spin" size={18} /> : <Play size={18}/>}
//                     Trigger Manual Draw
//                   </button>
//                 )}
//                 <button 
//                   onClick={() => setSelectedElection(null)} 
//                   className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 font-semibold">Showing All System Elections</p>
//             <p className="text-sm text-blue-700 mt-1">
//               Elections from all creators • Lottery stats from Voting Service • Winners detected automatically
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/pages/superAdmin/ElectionStatsPage.jsx - USING getAllElections
// /**
//  * STATUS SOURCES EXPLAINED:
//  * 
//  * FROM DATABASE (via APIs):
//  * - Election basic info: title, dates, status, lottery_enabled (from election-service)
//  * - Lottery data: total_prize_pool, participant_count, winner_count, has_been_drawn (from voting-service)
//  * - Winners array with claimed status (from voting-service)
//  * 
//  * CALCULATED CLIENT-SIDE:
//  * - drawStatus: 'pending' | 'completed' | 'failed'
//  *   • 'completed' if has_been_drawn === true OR winners.length > 0
//  *   • 'failed' if lottery enabled + draw date passed + NOT drawn yet
//  *   • 'pending' otherwise
//  * 
//  * - prizesDistributed: true | false
//  *   • True if winners.length > 0 (prizes are auto-credited to wallets)
//  *   • False if no winners yet
//  */
// import React, { useState, useMemo, useEffect } from 'react';
// import { AlertTriangle, CheckCircle, Clock, Calendar, Play, X, TrendingUp, Loader } from 'lucide-react';
// import { getAllElections } from '../../redux/api/election/electionApi';
// import { useDrawLotteryMutation } from '../../redux/api/lotteryyy/lotteryDrawApi';
// import { toast } from 'react-toastify';

// export default function ElectionStatsPage() {
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [enrichedElections, setEnrichedElections] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [triggerDraw, { isLoading: drawLoading }] = useDrawLotteryMutation();

//   // ✅ Fetch ALL elections using axios
//   useEffect(() => {
//     const fetchAllElections = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const response = await getAllElections(1, 100, 'all');
//         console.log('📊 getAllElections response:', response);
        
//         const elections = response.data?.elections || response.elections || [];
//         console.log('📊 Total elections:', elections.length);
        
//         // Fetch lottery data for each
//         const enrichedData = await Promise.all(
//           elections.map(async (election) => {
//             const electionId = election.election_id || election.id;
            
//             if (!electionId) return null;

//             try {
//               const res = await fetch(
//                 `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/lottery/elections/${electionId}/lottery`,
//                 {
//                   headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                     'x-user-data': localStorage.getItem('userData') || '{}',
//                   }
//                 }
//               );

//               let lotteryData = {};
//               if (res.ok) {
//                 const data = await res.json();
//                 lotteryData = data.data || data;
//                 console.log(`🎰 Lottery data for election ${electionId}:`, lotteryData);
//               }

//               const now = new Date();
//               const drawDate = election.lottery_draw_date ? new Date(election.lottery_draw_date) : null;
              
//               // Get winners array
//               const winners = lotteryData.winners || [];
              
//               // ✅ FIX: Check multiple indicators for completed draw
//               let drawStatus = 'pending';
//               const hasBeenDrawn = lotteryData.has_been_drawn === true || 
//                                    lotteryData.hasBeenDrawn === true ||
//                                    winners.length > 0; // If winners exist, draw is completed
              
//               if (hasBeenDrawn) {
//                 drawStatus = 'completed';
//               } else if (election.lottery_enabled && drawDate && now > drawDate) {
//                 drawStatus = 'failed';
//               }

//               // ✅ FIX: prizesDistributed should be true if winners exist (prizes are automatically credited)
//               // Monetary prizes are auto-credited to wallets, so they're distributed immediately
//               const prizesDistributed = winners.length > 0;

//               console.log(`Election ${electionId}: drawStatus=${drawStatus}, hasBeenDrawn=${hasBeenDrawn}, winnersCount=${winners.length}, prizesDistributed=${prizesDistributed}`);

//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: parseInt(lotteryData.participant_count || 0),
//                 prizePool: parseFloat(lotteryData.total_prize_pool || 0),
//                 winnersCount: parseInt(lotteryData.winner_count || winners.length || 0),
//                 drawStatus: drawStatus,
//                 prizesDistributed: prizesDistributed,
//                 lotteryEnabled: election.lottery_enabled === true,
//                 rewardType: lotteryData.reward_type || lotteryData.rewardType,
//               };
//             } catch (error) {
//               console.error(`Error fetching lottery for ${electionId}:`, error);
//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: 0,
//                 prizePool: 0,
//                 winnersCount: 0,
//                 drawStatus: 'pending',
//                 prizesDistributed: false,
//                 lotteryEnabled: election.lottery_enabled === true,
//               };
//             }
//           })
//         );

//         setEnrichedElections(enrichedData.filter(e => e !== null));
//       } catch (err) {
//         console.error('Error fetching elections:', err);
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllElections();
//   }, []);

//   const refetch = async () => {
//     setEnrichedElections([]);
//     setIsLoading(true);
//     try {
//         /*eslint-disable*/
//       const response = await getAllElections(1, 100, 'all');
//       // Process again...
//       window.location.reload();
//     } catch (err) {
//       setError(err);
//       setIsLoading(false);
//     }
//   };

//   const filteredElections = useMemo(() => {
//     return enrichedElections.filter(e => {
//       if (filterStatus !== 'all') {
//         if (filterStatus === 'draft' && e.status !== 'draft') return false;
//         if (filterStatus === 'active' && e.status !== 'active') return false;
//         if (filterStatus === 'ended' && e.status !== 'ended') return false;
//         if (filterStatus === 'completed' && e.status !== 'completed') return false;
//         if (filterStatus === 'failed' && e.drawStatus !== 'failed') return false;
//       }
      
//       if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !e.id.toString().includes(searchTerm)) {
//         return false;
//       }
      
//       return true;
//     });
//   }, [enrichedElections, searchTerm, filterStatus]);

//   const stats = useMemo(() => {
//     const totalPrize = enrichedElections.reduce((sum, e) => sum + (parseFloat(e.prizePool) || 0), 0);
//     const totalVotes = enrichedElections.reduce((sum, e) => sum + (parseInt(e.totalVotes) || 0), 0);

//     return {
//       totalElections: enrichedElections.length,
//       activeElections: enrichedElections.filter(e => e.status === 'active').length,
//       totalPrizePool: totalPrize,
//       totalVotes: totalVotes,
//       failedDraws: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//     };
//   }, [enrichedElections]);

//   const filterCounts = useMemo(() => ({
//     all: enrichedElections.length,
//     draft: enrichedElections.filter(e => e.status === 'draft').length,
//     active: enrichedElections.filter(e => e.status === 'active').length,
//     ended: enrichedElections.filter(e => e.status === 'ended').length,
//     completed: enrichedElections.filter(e => e.status === 'completed').length,
//     failed: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//   }), [enrichedElections]);

//   const handleManualDraw = async (electionId) => {
//     if (drawLoading) return;
//     if (!confirm('Are you sure you want to trigger a manual lottery draw?')) return;
    
//     try {
//       await triggerDraw(electionId).unwrap();
//       toast.success('Lottery draw completed successfully!');
//       refetch();
//     } catch (error) {
//       console.error('Manual draw error:', error);
//       toast.error(error?.data?.message || 'Failed to trigger lottery draw');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const getDaysUntilDraw = (drawDate) => {
//     if (!drawDate) return null;
//     try {
//       const now = new Date();
//       const draw = new Date(drawDate);
//       const diff = Math.ceil((draw - now) / (1000 * 60 * 60 * 24));
//       return diff;
//     } catch {
//       return null;
//     }
//   };

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//           <p className="text-red-800 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-sm text-red-600">{error?.message || 'Failed to load elections'}</p>
//           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//             <p className="text-gray-600">Loading all elections...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <TrendingUp className="w-8 h-8 text-purple-600" />
//           Election Statistics & Monitoring
//         </h1>
//         <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Failed Draws</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedDraws}</p>
//               <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Elections</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalElections}</p>
//               <p className="text-xs text-blue-600 mt-1">{stats.activeElections} active | {stats.totalVotes} total votes</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Total Prize Pool</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">
//                 ${(stats.totalPrizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//               </p>
//               <p className="text-xs text-green-600 mt-1">Across all elections</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
//         <div className="flex flex-wrap gap-2">
//           {[
//             {id:'all', label:'All Elections', count: filterCounts.all},
//             {id:'draft', label:'Draft', count: filterCounts.draft},
//             {id:'active', label:'Active', count: filterCounts.active},
//             {id:'ended', label:'Ended', count: filterCounts.ended},
//             {id:'completed', label:'Completed', count: filterCounts.completed},
//             {id:'failed', label:'Failed Draws', count: filterCounts.failed},
//           ].map(f => (
//             <button
//               key={f.id}
//               onClick={() => setFilterStatus(f.id)}
//               className={`px-3 py-1.5 rounded text-sm font-medium transition ${
//                 filterStatus === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {f.label} ({f.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <input
//           type="text"
//           placeholder="Search by name, election ID..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       <p className="text-sm text-gray-600">Showing {filteredElections.length} result{filteredElections.length !== 1 ? 's' : ''}</p>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Clock className="inline w-4 h-4 mr-1" />Timeline
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredElections.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center">
//                     <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600 font-medium">No Elections Found</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {searchTerm ? 'Try adjusting your search' : 'No elections available'}
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredElections.map(e => {
//                   const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                  
//                   return (
//                     <tr key={e.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-xs space-y-1">
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />Start: {formatDate(e.startDate)}
//                           </div>
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />End: {formatDate(e.endDate)}
//                           </div>
                          
//                           {/* ✅ IMPROVED: Show election status dynamically */}
//                           {(() => {
//                             const now = new Date();
//                             const endDate = e.endDate ? new Date(e.endDate) : null;
//                             const startDate = e.startDate ? new Date(e.startDate) : null;
                            
//                             if (endDate && now > endDate) {
//                               // Election ended
//                               const daysAgo = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-gray-700">
//                                   <CheckCircle size={12} />
//                                   Ended {daysAgo > 0 ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago` : 'today'}
//                                 </div>
//                               );
//                             } else if (startDate && now < startDate) {
//                               // Not started yet
//                               const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-blue-600">
//                                   <Clock size={12} />
//                                   Starts in {daysUntil} day{daysUntil > 1 ? 's' : ''}
//                                 </div>
//                               );
//                             } else if (endDate) {
//                               // Active - show days remaining
//                               const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-green-600">
//                                   <TrendingUp size={12} />
//                                   {daysRemaining > 0 
//                                     ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` 
//                                     : 'Ends today'}
//                                 </div>
//                               );
//                             }
//                             return null;
//                           })()}
                          
//                           {/* Lottery draw info */}
//                           {e.lotteryEnabled && e.drawDate && (
//                             <>
//                               <div className="flex items-center gap-1 font-medium text-purple-600 pt-1 border-t border-gray-200 mt-1">
//                                 <Calendar size={12} />Draw: {formatDate(e.drawDate)}
//                               </div>
//                               {(() => {
//                                 const daysUntilDraw = getDaysUntilDraw(e.drawDate);
//                                 if (daysUntilDraw !== null && daysUntilDraw > 0) {
//                                   return (
//                                     <div className="text-xs text-purple-600">
//                                       Draw in {daysUntilDraw} day{daysUntilDraw > 1 ? 's' : ''}
//                                     </div>
//                                   );
//                                 } else if (daysUntilDraw !== null && daysUntilDraw < 0) {
//                                   return (
//                                     <div className="text-xs text-orange-600">
//                                       Draw was {Math.abs(daysUntilDraw)} day{Math.abs(daysUntilDraw) > 1 ? 's' : ''} ago
//                                     </div>
//                                   );
//                                 }
//                                 return null;
//                               })()}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{e.title}</div>
//                         <div className="text-xs text-gray-500">ID: #{e.id}</div>
//                         <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
//                           e.status==='active'?'bg-green-100 text-green-800':
//                           e.status==='completed'?'bg-blue-100 text-blue-800':
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {e.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-xs space-y-1">
//                           <div>Votes: <span className="font-semibold">{e.totalVotes > 0 ? e.totalVotes : '0 (No votes yet)'}</span></div>
//                           {e.lotteryEnabled && (
//                             <>
//                               <div>Prize: <span className="font-semibold text-green-600">
//                                 ${(e.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                               </span></div>
//                               <div>Winners: <span className="font-semibold">{e.winnersCount > 0 ? e.winnersCount : 'TBD'}</span></div>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <div className="space-y-2">
//                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                               e.drawStatus==='pending'?'bg-yellow-100 text-yellow-800':
//                               e.drawStatus==='completed'?'bg-green-100 text-green-800':
//                               'bg-red-100 text-red-800'
//                             }`}>
//                               {e.drawStatus==='pending'&&<Clock size={14}/>}
//                               {e.drawStatus==='completed'&&<CheckCircle size={14}/>}
//                               {e.drawStatus==='failed'&&<AlertTriangle size={14}/>}
//                               {e.drawStatus}
//                             </span>
//                             {e.drawStatus==='failed'&&(
//                               <button
//                                 onClick={() => handleManualDraw(e.id)}
//                                 disabled={drawLoading}
//                                 className="w-full mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
//                               >
//                                 {drawLoading ? <Loader className="animate-spin" size={12} /> : <Play size={12}/>}
//                                 Manual Draw
//                               </button>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-gray-500">No lottery</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                             e.prizesDistributed?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {e.prizesDistributed?<CheckCircle size={14}/>:<Clock size={14}/>}
//                             {e.prizesDistributed?'Distributed':'Pending'}
//                           </span>
//                         ) : (
//                           <span className="text-xs text-gray-500">N/A</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setSelectedElection(e)}
//                           className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-medium"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedElection && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">{selectedElection.title}</h2>
//                 <p className="text-sm text-gray-600 mt-1">Election ID: #{selectedElection.id}</p>
//               </div>
//               <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24}/>
//               </button>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Status</p>
//                   <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.status}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Total Votes</p>
//                   <p className="text-sm font-semibold mt-1">{selectedElection.totalVotes}</p>
//                 </div>
//                 {selectedElection.lotteryEnabled && (
//                   <>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Prize Pool</p>
//                       <p className="text-sm font-semibold text-green-600 mt-1">
//                         ${(selectedElection.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Draw Status</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.drawStatus}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Reward Type</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.rewardType?.replace('_', ' ')}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Winners</p>
//                       <p className="text-sm font-semibold mt-1">{selectedElection.winnersCount}</p>
//                     </div>
//                   </>
//                 )}
//               </div>
              
//               <div className="flex gap-3 pt-4 border-t border-gray-200">
//                 {selectedElection.drawStatus === 'failed' && (
//                   <button
//                     onClick={() => {
//                       handleManualDraw(selectedElection.id);
//                       setSelectedElection(null);
//                     }}
//                     disabled={drawLoading}
//                     className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {drawLoading ? <Loader className="animate-spin" size={18} /> : <Play size={18}/>}
//                     Trigger Manual Draw
//                   </button>
//                 )}
//                 <button onClick={() => setSelectedElection(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 font-semibold">Showing All System Elections</p>
//             <p className="text-sm text-blue-700 mt-1">
//               Elections from all creators • Lottery stats from Voting Service • Winners detected automatically
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/pages/superAdmin/ElectionStatsPage.jsx - USING getAllElections
// /**
//  * STATUS SOURCES EXPLAINED:
//  * 
//  * FROM DATABASE (via APIs):
//  * - Election basic info: title, dates, status, lottery_enabled (from election-service)
//  * - Lottery data: total_prize_pool, participant_count, winner_count, has_been_drawn (from voting-service)
//  * - Winners array with claimed status (from voting-service)
//  * 
//  * CALCULATED CLIENT-SIDE:
//  * - drawStatus: 'pending' | 'completed' | 'failed'
//  *   • 'completed' if has_been_drawn === true
//  *   • 'failed' if lottery enabled + draw date passed + NOT drawn yet
//  *   • 'pending' otherwise
//  * 
//  * - prizesDistributed: true | false
//  *   • Only true if winners.length > 0 AND all winners have claimed === true
//  *   • False if no winners yet OR some prizes unclaimed
//  * 
//  * - Timeline status: "X days remaining", "Ended X days ago", "Starts in X days"
//  *   • Calculated from start_date and end_date vs current date
//  */
// import React, { useState, useMemo, useEffect } from 'react';
// import { AlertTriangle, CheckCircle, Clock, Calendar, Play, X, TrendingUp, Loader } from 'lucide-react';
// import { getAllElections } from '../../redux/api/election/electionApi';
// import { useDrawLotteryMutation } from '../../redux/api/lotteryyy/lotteryDrawApi';
// import { toast } from 'react-toastify';

// export default function ElectionStatsPage() {
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [enrichedElections, setEnrichedElections] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [triggerDraw, { isLoading: drawLoading }] = useDrawLotteryMutation();

//   // ✅ Fetch ALL elections using axios
//   useEffect(() => {
//     const fetchAllElections = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const response = await getAllElections(1, 100, 'all');
//         console.log('📊 getAllElections response:', response);
        
//         const elections = response.data?.elections || response.elections || [];
//         console.log('📊 Total elections:', elections.length);
        
//         // Fetch lottery data for each
//         const enrichedData = await Promise.all(
//           elections.map(async (election) => {
//             const electionId = election.election_id || election.id;
            
//             if (!electionId) return null;

//             try {
//               const res = await fetch(
//                 `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/lottery/elections/${electionId}/lottery`,
//                 {
//                   headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                     'x-user-data': localStorage.getItem('userData') || '{}',
//                   }
//                 }
//               );

//               let lotteryData = {};
//               if (res.ok) {
//                 const data = await res.json();
//                 lotteryData = data.data || data;
//               }

//               const now = new Date();
//               const drawDate = election.lottery_draw_date ? new Date(election.lottery_draw_date) : null;
              
//               let drawStatus = 'pending';
//               if (lotteryData.has_been_drawn === true || lotteryData.hasBeenDrawn === true) {
//                 drawStatus = 'completed';
//               } else if (election.lottery_enabled && drawDate && now > drawDate) {
//                 drawStatus = 'failed';
//               }

//               const winners = lotteryData.winners || [];
//               const allPrizesClaimed = winners.length > 0 && winners.every(w => w.claimed === true);

//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: parseInt(lotteryData.participant_count || 0),
//                 prizePool: parseFloat(lotteryData.total_prize_pool || 0),
//                 winnersCount: parseInt(lotteryData.winner_count || 0),
//                 drawStatus: drawStatus,
//                 prizesDistributed: allPrizesClaimed,
//                 lotteryEnabled: election.lottery_enabled === true,
//                 rewardType: lotteryData.reward_type || lotteryData.rewardType,
//               };
//             } catch (error) {
//               console.error(`Error fetching lottery for ${electionId}:`, error);
//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: 0,
//                 prizePool: 0,
//                 winnersCount: 0,
//                 drawStatus: 'pending',
//                 prizesDistributed: false,
//                 lotteryEnabled: election.lottery_enabled === true,
//               };
//             }
//           })
//         );

//         setEnrichedElections(enrichedData.filter(e => e !== null));
//       } catch (err) {
//         console.error('Error fetching elections:', err);
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllElections();
//   }, []);

//   const refetch = async () => {
//     setEnrichedElections([]);
//     setIsLoading(true);
//     try {
//         /*eslint-disable*/
//       const response = await getAllElections(1, 100, 'all');
//       // Process again...
//       window.location.reload();
//     } catch (err) {
//       setError(err);
//       setIsLoading(false);
//     }
//   };

//   const filteredElections = useMemo(() => {
//     return enrichedElections.filter(e => {
//       if (filterStatus !== 'all') {
//         if (filterStatus === 'draft' && e.status !== 'draft') return false;
//         if (filterStatus === 'active' && e.status !== 'active') return false;
//         if (filterStatus === 'ended' && e.status !== 'ended') return false;
//         if (filterStatus === 'completed' && e.status !== 'completed') return false;
//         if (filterStatus === 'failed' && e.drawStatus !== 'failed') return false;
//       }
      
//       if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !e.id.toString().includes(searchTerm)) {
//         return false;
//       }
      
//       return true;
//     });
//   }, [enrichedElections, searchTerm, filterStatus]);

//   const stats = useMemo(() => {
//     const totalPrize = enrichedElections.reduce((sum, e) => sum + (parseFloat(e.prizePool) || 0), 0);
//     const totalVotes = enrichedElections.reduce((sum, e) => sum + (parseInt(e.totalVotes) || 0), 0);

//     return {
//       totalElections: enrichedElections.length,
//       activeElections: enrichedElections.filter(e => e.status === 'active').length,
//       totalPrizePool: totalPrize,
//       totalVotes: totalVotes,
//       failedDraws: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//     };
//   }, [enrichedElections]);

//   const filterCounts = useMemo(() => ({
//     all: enrichedElections.length,
//     draft: enrichedElections.filter(e => e.status === 'draft').length,
//     active: enrichedElections.filter(e => e.status === 'active').length,
//     ended: enrichedElections.filter(e => e.status === 'ended').length,
//     completed: enrichedElections.filter(e => e.status === 'completed').length,
//     failed: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//   }), [enrichedElections]);

//   const handleManualDraw = async (electionId) => {
//     if (drawLoading) return;
//     if (!confirm('Are you sure you want to trigger a manual lottery draw?')) return;
    
//     try {
//       await triggerDraw(electionId).unwrap();
//       toast.success('Lottery draw completed successfully!');
//       refetch();
//     } catch (error) {
//       console.error('Manual draw error:', error);
//       toast.error(error?.data?.message || 'Failed to trigger lottery draw');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const getDaysUntilDraw = (drawDate) => {
//     if (!drawDate) return null;
//     try {
//       const now = new Date();
//       const draw = new Date(drawDate);
//       const diff = Math.ceil((draw - now) / (1000 * 60 * 60 * 24));
//       return diff;
//     } catch {
//       return null;
//     }
//   };

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//           <p className="text-red-800 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-sm text-red-600">{error?.message || 'Failed to load elections'}</p>
//           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//             <p className="text-gray-600">Loading all elections...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <TrendingUp className="w-8 h-8 text-purple-600" />
//           Election Statistics & Monitoring
//         </h1>
//         <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Failed Draws</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedDraws}</p>
//               <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Elections</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalElections}</p>
//               <p className="text-xs text-blue-600 mt-1">{stats.activeElections} active | {stats.totalVotes} total votes</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Total Prize Pool</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">
//                 ${(stats.totalPrizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//               </p>
//               <p className="text-xs text-green-600 mt-1">Across all elections</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
//         <div className="flex flex-wrap gap-2">
//           {[
//             {id:'all', label:'All Elections', count: filterCounts.all},
//             {id:'draft', label:'Draft', count: filterCounts.draft},
//             {id:'active', label:'Active', count: filterCounts.active},
//             {id:'ended', label:'Ended', count: filterCounts.ended},
//             {id:'completed', label:'Completed', count: filterCounts.completed},
//             {id:'failed', label:'Failed Draws', count: filterCounts.failed},
//           ].map(f => (
//             <button
//               key={f.id}
//               onClick={() => setFilterStatus(f.id)}
//               className={`px-3 py-1.5 rounded text-sm font-medium transition ${
//                 filterStatus === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {f.label} ({f.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <input
//           type="text"
//           placeholder="Search by name, election ID..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       <p className="text-sm text-gray-600">Showing {filteredElections.length} result{filteredElections.length !== 1 ? 's' : ''}</p>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Clock className="inline w-4 h-4 mr-1" />Timeline
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredElections.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center">
//                     <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600 font-medium">No Elections Found</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {searchTerm ? 'Try adjusting your search' : 'No elections available'}
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredElections.map(e => {
//                   const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                  
//                   return (
//                     <tr key={e.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-xs space-y-1">
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />Start: {formatDate(e.startDate)}
//                           </div>
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />End: {formatDate(e.endDate)}
//                           </div>
                          
//                           {/* ✅ IMPROVED: Show election status dynamically */}
//                           {(() => {
//                             const now = new Date();
//                             const endDate = e.endDate ? new Date(e.endDate) : null;
//                             const startDate = e.startDate ? new Date(e.startDate) : null;
                            
//                             if (endDate && now > endDate) {
//                               // Election ended
//                               const daysAgo = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-gray-700">
//                                   <CheckCircle size={12} />
//                                   Ended {daysAgo > 0 ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago` : 'today'}
//                                 </div>
//                               );
//                             } else if (startDate && now < startDate) {
//                               // Not started yet
//                               const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-blue-600">
//                                   <Clock size={12} />
//                                   Starts in {daysUntil} day{daysUntil > 1 ? 's' : ''}
//                                 </div>
//                               );
//                             } else if (endDate) {
//                               // Active - show days remaining
//                               const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
//                               return (
//                                 <div className="flex items-center gap-1 font-medium text-green-600">
//                                   <TrendingUp size={12} />
//                                   {daysRemaining > 0 
//                                     ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` 
//                                     : 'Ends today'}
//                                 </div>
//                               );
//                             }
//                             return null;
//                           })()}
                          
//                           {/* Lottery draw info */}
//                           {e.lotteryEnabled && e.drawDate && (
//                             <>
//                               <div className="flex items-center gap-1 font-medium text-purple-600 pt-1 border-t border-gray-200 mt-1">
//                                 <Calendar size={12} />Draw: {formatDate(e.drawDate)}
//                               </div>
//                               {(() => {
//                                 const daysUntilDraw = getDaysUntilDraw(e.drawDate);
//                                 if (daysUntilDraw !== null && daysUntilDraw > 0) {
//                                   return (
//                                     <div className="text-xs text-purple-600">
//                                       Draw in {daysUntilDraw} day{daysUntilDraw > 1 ? 's' : ''}
//                                     </div>
//                                   );
//                                 } else if (daysUntilDraw !== null && daysUntilDraw < 0) {
//                                   return (
//                                     <div className="text-xs text-orange-600">
//                                       Draw was {Math.abs(daysUntilDraw)} day{Math.abs(daysUntilDraw) > 1 ? 's' : ''} ago
//                                     </div>
//                                   );
//                                 }
//                                 return null;
//                               })()}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{e.title}</div>
//                         <div className="text-xs text-gray-500">ID: #{e.id}</div>
//                         <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
//                           e.status==='active'?'bg-green-100 text-green-800':
//                           e.status==='completed'?'bg-blue-100 text-blue-800':
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {e.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-xs space-y-1">
//                           <div>Votes: <span className="font-semibold">{e.totalVotes > 0 ? e.totalVotes : '0 (No votes yet)'}</span></div>
//                           {e.lotteryEnabled && (
//                             <>
//                               <div>Prize: <span className="font-semibold text-green-600">
//                                 ${(e.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                               </span></div>
//                               <div>Winners: <span className="font-semibold">{e.winnersCount > 0 ? e.winnersCount : 'TBD'}</span></div>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <div className="space-y-2">
//                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                               e.drawStatus==='pending'?'bg-yellow-100 text-yellow-800':
//                               e.drawStatus==='completed'?'bg-green-100 text-green-800':
//                               'bg-red-100 text-red-800'
//                             }`}>
//                               {e.drawStatus==='pending'&&<Clock size={14}/>}
//                               {e.drawStatus==='completed'&&<CheckCircle size={14}/>}
//                               {e.drawStatus==='failed'&&<AlertTriangle size={14}/>}
//                               {e.drawStatus}
//                             </span>
//                             {e.drawStatus==='failed'&&(
//                               <button
//                                 onClick={() => handleManualDraw(e.id)}
//                                 disabled={drawLoading}
//                                 className="w-full mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
//                               >
//                                 {drawLoading ? <Loader className="animate-spin" size={12} /> : <Play size={12}/>}
//                                 Manual Draw
//                               </button>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-gray-500">No lottery</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                             e.prizesDistributed?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {e.prizesDistributed?<CheckCircle size={14}/>:<Clock size={14}/>}
//                             {e.prizesDistributed?'Distributed':'Pending'}
//                           </span>
//                         ) : (
//                           <span className="text-xs text-gray-500">N/A</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setSelectedElection(e)}
//                           className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-medium"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedElection && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">{selectedElection.title}</h2>
//                 <p className="text-sm text-gray-600 mt-1">Election ID: #{selectedElection.id}</p>
//               </div>
//               <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24}/>
//               </button>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Status</p>
//                   <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.status}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Total Votes</p>
//                   <p className="text-sm font-semibold mt-1">{selectedElection.totalVotes}</p>
//                 </div>
//                 {selectedElection.lotteryEnabled && (
//                   <>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Prize Pool</p>
//                       <p className="text-sm font-semibold text-green-600 mt-1">
//                         ${(selectedElection.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Draw Status</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.drawStatus}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Reward Type</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.rewardType?.replace('_', ' ')}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Winners</p>
//                       <p className="text-sm font-semibold mt-1">{selectedElection.winnersCount}</p>
//                     </div>
//                   </>
//                 )}
//               </div>
              
//               <div className="flex gap-3 pt-4 border-t border-gray-200">
//                 {selectedElection.drawStatus === 'failed' && (
//                   <button
//                     onClick={() => {
//                       handleManualDraw(selectedElection.id);
//                       setSelectedElection(null);
//                     }}
//                     disabled={drawLoading}
//                     className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {drawLoading ? <Loader className="animate-spin" size={18} /> : <Play size={18}/>}
//                     Trigger Manual Draw
//                   </button>
//                 )}
//                 <button onClick={() => setSelectedElection(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 font-semibold">Showing All System Elections</p>
//             <p className="text-sm text-blue-700 mt-1">
//               Elections from all creators • Lottery stats from Voting Service
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/pages/superAdmin/ElectionStatsPage.jsx - USING getAllElections
// import React, { useState, useMemo, useEffect } from 'react';
// import { AlertTriangle, CheckCircle, Clock, Calendar, Play, X, TrendingUp, Loader } from 'lucide-react';
// import { getAllElections } from '../../redux/api/election/electionApi';
// import { useDrawLotteryMutation } from '../../redux/api/lotteryyy/lotteryDrawApi';
// import { toast } from 'react-toastify';

// export default function ElectionStatsPage() {
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [enrichedElections, setEnrichedElections] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [triggerDraw, { isLoading: drawLoading }] = useDrawLotteryMutation();

//   // ✅ Fetch ALL elections using axios
//   useEffect(() => {
//     const fetchAllElections = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const response = await getAllElections(1, 100, 'all');
//         console.log('📊 getAllElections response:', response);
        
//         const elections = response.data?.elections || response.elections || [];
//         console.log('📊 Total elections:', elections.length);
        
//         // Fetch lottery data for each
//         const enrichedData = await Promise.all(
//           elections.map(async (election) => {
//             const electionId = election.election_id || election.id;
            
//             if (!electionId) return null;

//             try {
//               const res = await fetch(
//                 `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/lottery/elections/${electionId}/lottery`,
//                 {
//                   headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                     'x-user-data': localStorage.getItem('userData') || '{}',
//                   }
//                 }
//               );

//               let lotteryData = {};
//               if (res.ok) {
//                 const data = await res.json();
//                 lotteryData = data.data || data;
//               }

//               const now = new Date();
//               const drawDate = election.lottery_draw_date ? new Date(election.lottery_draw_date) : null;
              
//               let drawStatus = 'pending';
//               if (lotteryData.has_been_drawn === true || lotteryData.hasBeenDrawn === true) {
//                 drawStatus = 'completed';
//               } else if (election.lottery_enabled && drawDate && now > drawDate) {
//                 drawStatus = 'failed';
//               }

//               const winners = lotteryData.winners || [];
//               const allPrizesClaimed = winners.length > 0 && winners.every(w => w.claimed === true);

//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: parseInt(lotteryData.participant_count || 0),
//                 prizePool: parseFloat(lotteryData.total_prize_pool || 0),
//                 winnersCount: parseInt(lotteryData.winner_count || 0),
//                 drawStatus: drawStatus,
//                 prizesDistributed: allPrizesClaimed,
//                 lotteryEnabled: election.lottery_enabled === true,
//                 rewardType: lotteryData.reward_type || lotteryData.rewardType,
//               };
//             } catch (error) {
//               console.error(`Error fetching lottery for ${electionId}:`, error);
//               return {
//                 id: electionId,
//                 title: election.title || 'Untitled Election',
//                 startDate: election.start_date,
//                 endDate: election.end_date,
//                 drawDate: election.lottery_draw_date,
//                 status: election.status || 'draft',
//                 totalVotes: 0,
//                 prizePool: 0,
//                 winnersCount: 0,
//                 drawStatus: 'pending',
//                 prizesDistributed: false,
//                 lotteryEnabled: election.lottery_enabled === true,
//               };
//             }
//           })
//         );

//         setEnrichedElections(enrichedData.filter(e => e !== null));
//       } catch (err) {
//         console.error('Error fetching elections:', err);
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllElections();
//   }, []);

//   const refetch = async () => {
//     setEnrichedElections([]);
//     setIsLoading(true);
//     try {
//         /*eslint-disable*/
//       const response = await getAllElections(1, 100, 'all');
//       // Process again...
//       window.location.reload();
//     } catch (err) {
//       setError(err);
//       setIsLoading(false);
//     }
//   };

//   const filteredElections = useMemo(() => {
//     return enrichedElections.filter(e => {
//       if (filterStatus !== 'all') {
//         if (filterStatus === 'draft' && e.status !== 'draft') return false;
//         if (filterStatus === 'active' && e.status !== 'active') return false;
//         if (filterStatus === 'ended' && e.status !== 'ended') return false;
//         if (filterStatus === 'completed' && e.status !== 'completed') return false;
//         if (filterStatus === 'failed' && e.drawStatus !== 'failed') return false;
//       }
      
//       if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !e.id.toString().includes(searchTerm)) {
//         return false;
//       }
      
//       return true;
//     });
//   }, [enrichedElections, searchTerm, filterStatus]);

//   const stats = useMemo(() => {
//     const totalPrize = enrichedElections.reduce((sum, e) => sum + (parseFloat(e.prizePool) || 0), 0);
//     const totalVotes = enrichedElections.reduce((sum, e) => sum + (parseInt(e.totalVotes) || 0), 0);

//     return {
//       totalElections: enrichedElections.length,
//       activeElections: enrichedElections.filter(e => e.status === 'active').length,
//       totalPrizePool: totalPrize,
//       totalVotes: totalVotes,
//       failedDraws: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//     };
//   }, [enrichedElections]);

//   const filterCounts = useMemo(() => ({
//     all: enrichedElections.length,
//     draft: enrichedElections.filter(e => e.status === 'draft').length,
//     active: enrichedElections.filter(e => e.status === 'active').length,
//     ended: enrichedElections.filter(e => e.status === 'ended').length,
//     completed: enrichedElections.filter(e => e.status === 'completed').length,
//     failed: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//   }), [enrichedElections]);

//   const handleManualDraw = async (electionId) => {
//     if (drawLoading) return;
//     if (!confirm('Are you sure you want to trigger a manual lottery draw?')) return;
    
//     try {
//       await triggerDraw(electionId).unwrap();
//       toast.success('Lottery draw completed successfully!');
//       refetch();
//     } catch (error) {
//       console.error('Manual draw error:', error);
//       toast.error(error?.data?.message || 'Failed to trigger lottery draw');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const getDaysUntilDraw = (drawDate) => {
//     if (!drawDate) return null;
//     try {
//       const now = new Date();
//       const draw = new Date(drawDate);
//       const diff = Math.ceil((draw - now) / (1000 * 60 * 60 * 24));
//       return diff;
//     } catch {
//       return null;
//     }
//   };

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//           <p className="text-red-800 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-sm text-red-600">{error?.message || 'Failed to load elections'}</p>
//           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//             <p className="text-gray-600">Loading all elections...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <TrendingUp className="w-8 h-8 text-purple-600" />
//           Election Statistics & Monitoring
//         </h1>
//         <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Failed Draws</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedDraws}</p>
//               <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Elections</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalElections}</p>
//               <p className="text-xs text-blue-600 mt-1">{stats.activeElections} active | {stats.totalVotes} total votes</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Total Prize Pool</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">
//                 ${(stats.totalPrizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//               </p>
//               <p className="text-xs text-green-600 mt-1">Across all elections</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
//         <div className="flex flex-wrap gap-2">
//           {[
//             {id:'all', label:'All Elections', count: filterCounts.all},
//             {id:'draft', label:'Draft', count: filterCounts.draft},
//             {id:'active', label:'Active', count: filterCounts.active},
//             {id:'ended', label:'Ended', count: filterCounts.ended},
//             {id:'completed', label:'Completed', count: filterCounts.completed},
//             {id:'failed', label:'Failed Draws', count: filterCounts.failed},
//           ].map(f => (
//             <button
//               key={f.id}
//               onClick={() => setFilterStatus(f.id)}
//               className={`px-3 py-1.5 rounded text-sm font-medium transition ${
//                 filterStatus === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {f.label} ({f.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <input
//           type="text"
//           placeholder="Search by name, election ID..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       <p className="text-sm text-gray-600">Showing {filteredElections.length} result{filteredElections.length !== 1 ? 's' : ''}</p>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Clock className="inline w-4 h-4 mr-1" />Timeline
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredElections.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center">
//                     <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600 font-medium">No Elections Found</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {searchTerm ? 'Try adjusting your search' : 'No elections available'}
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredElections.map(e => {
//                   const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                  
//                   return (
//                     <tr key={e.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-xs space-y-1">
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />Start: {formatDate(e.startDate)}
//                           </div>
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />End: {formatDate(e.endDate)}
//                           </div>
//                           {e.lotteryEnabled && e.drawDate && (
//                             <>
//                               <div className="flex items-center gap-1 font-medium text-purple-600">
//                                 <Calendar size={12} />Draw: {formatDate(e.drawDate)}
//                               </div>
//                               {daysUntilDraw !== null && daysUntilDraw > 0 && (
//                                 <div className="text-xs text-gray-500">{daysUntilDraw} days until draw</div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{e.title}</div>
//                         <div className="text-xs text-gray-500">ID: #{e.id}</div>
//                         <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
//                           e.status==='active'?'bg-green-100 text-green-800':
//                           e.status==='completed'?'bg-blue-100 text-blue-800':
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {e.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-xs space-y-1">
//                           <div>Votes: <span className="font-semibold">{e.totalVotes > 0 ? e.totalVotes : '0 (No votes yet)'}</span></div>
//                           {e.lotteryEnabled && (
//                             <>
//                               <div>Prize: <span className="font-semibold text-green-600">
//                                 ${(e.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                               </span></div>
//                               <div>Winners: <span className="font-semibold">{e.winnersCount > 0 ? e.winnersCount : 'TBD'}</span></div>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <div className="space-y-2">
//                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                               e.drawStatus==='pending'?'bg-yellow-100 text-yellow-800':
//                               e.drawStatus==='completed'?'bg-green-100 text-green-800':
//                               'bg-red-100 text-red-800'
//                             }`}>
//                               {e.drawStatus==='pending'&&<Clock size={14}/>}
//                               {e.drawStatus==='completed'&&<CheckCircle size={14}/>}
//                               {e.drawStatus==='failed'&&<AlertTriangle size={14}/>}
//                               {e.drawStatus}
//                             </span>
//                             {e.drawStatus==='failed'&&(
//                               <button
//                                 onClick={() => handleManualDraw(e.id)}
//                                 disabled={drawLoading}
//                                 className="w-full mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
//                               >
//                                 {drawLoading ? <Loader className="animate-spin" size={12} /> : <Play size={12}/>}
//                                 Manual Draw
//                               </button>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-gray-500">No lottery</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                             e.prizesDistributed?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {e.prizesDistributed?<CheckCircle size={14}/>:<Clock size={14}/>}
//                             {e.prizesDistributed?'Distributed':'Pending'}
//                           </span>
//                         ) : (
//                           <span className="text-xs text-gray-500">N/A</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setSelectedElection(e)}
//                           className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-medium"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedElection && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">{selectedElection.title}</h2>
//                 <p className="text-sm text-gray-600 mt-1">Election ID: #{selectedElection.id}</p>
//               </div>
//               <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24}/>
//               </button>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Status</p>
//                   <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.status}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Total Votes</p>
//                   <p className="text-sm font-semibold mt-1">{selectedElection.totalVotes}</p>
//                 </div>
//                 {selectedElection.lotteryEnabled && (
//                   <>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Prize Pool</p>
//                       <p className="text-sm font-semibold text-green-600 mt-1">
//                         ${(selectedElection.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Draw Status</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.drawStatus}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Reward Type</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.rewardType?.replace('_', ' ')}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Winners</p>
//                       <p className="text-sm font-semibold mt-1">{selectedElection.winnersCount}</p>
//                     </div>
//                   </>
//                 )}
//               </div>
              
//               <div className="flex gap-3 pt-4 border-t border-gray-200">
//                 {selectedElection.drawStatus === 'failed' && (
//                   <button
//                     onClick={() => {
//                       handleManualDraw(selectedElection.id);
//                       setSelectedElection(null);
//                     }}
//                     disabled={drawLoading}
//                     className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {drawLoading ? <Loader className="animate-spin" size={18} /> : <Play size={18}/>}
//                     Trigger Manual Draw
//                   </button>
//                 )}
//                 <button onClick={() => setSelectedElection(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 font-semibold">Showing All System Elections</p>
//             <p className="text-sm text-blue-700 mt-1">
//               Elections from all creators • Lottery stats from Voting Service
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/pages/superAdmin/ElectionStatsPage.jsx - PERFECT VERSION
// import React, { useState, useMemo, useEffect } from 'react';
// import { AlertTriangle, CheckCircle, Clock, Calendar, Play, X, TrendingUp, Loader } from 'lucide-react';
// import { useGetMyElectionsQuery } from '../../redux/api/election/electionApi';
// import { useDrawLotteryMutation } from '../../redux/api/lotteryyy/lotteryDrawApi';
// import { toast } from 'react-toastify';

// export default function ElectionStatsPage() {
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [enrichedElections, setEnrichedElections] = useState([]);

//   const { data: electionsData, isLoading: electionsLoading, error: electionsError, refetch } = useGetMyElectionsQuery({
//     page: 1,
//     limit: 100,
//     status: filterStatus === 'all' ? null : filterStatus,
//   });

//   const [triggerDraw, { isLoading: drawLoading }] = useDrawLotteryMutation();

//   // ✅ Fetch lottery data and merge
//   useEffect(() => {
//     const fetchLotteryData = async () => {
//       if (!electionsData?.elections) return;

//       const elections = electionsData.elections;
      
//       const enrichedData = await Promise.all(
//         elections.map(async (election) => {
//           const electionId = election.election_id || election.id;
          
//           if (!electionId) {
//             console.warn('⚠️ Election missing ID:', election);
//             return null;
//           }

//           try {
//             const response = await fetch(
//               `${import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api'}/lottery/elections/${electionId}/lottery`,
//               {
//                 headers: {
//                   'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                   'x-user-data': localStorage.getItem('userData') || '{}',
//                 }
//               }
//             );

//             let lotteryData = {};
//             if (response.ok) {
//               const data = await response.json();
//               lotteryData = data.data || data;
//               console.log(`✅ Lottery data for ${electionId}:`, lotteryData);
//             }

//             // Determine draw status
//             const now = new Date();
//             const drawDate = election.lottery_draw_date ? new Date(election.lottery_draw_date) : null;
            
//             let drawStatus = 'pending';
//             if (lotteryData.has_been_drawn === true || lotteryData.hasBeenDrawn === true) {
//               drawStatus = 'completed';
//             } else if (election.lottery_enabled && drawDate && now > drawDate) {
//               drawStatus = 'failed';
//             }

//             return {
//               id: electionId,
//               title: election.title || 'Untitled Election',
//               startDate: election.start_date,
//               endDate: election.end_date,
//               drawDate: election.lottery_draw_date,
//               status: election.status || 'draft',
//               // ✅ Use correct snake_case field names from API
//               totalVotes: parseInt(lotteryData.participant_count || 0),
//               prizePool: parseFloat(lotteryData.total_prize_pool || 0),
//               winnersCount: parseInt(lotteryData.winner_count || 0),
//               drawStatus: drawStatus,
//               prizesDistributed: (lotteryData.winners || []).every(w => w.claimed === true),
//               lotteryEnabled: election.lottery_enabled === true,
//               rewardType: lotteryData.reward_type || lotteryData.rewardType,
//             };
//           } catch (error) {
//             console.error(`❌ Error fetching lottery for ${electionId}:`, error);
            
//             return {
//               id: electionId,
//               title: election.title || 'Untitled Election',
//               startDate: election.start_date,
//               endDate: election.end_date,
//               drawDate: election.lottery_draw_date,
//               status: election.status || 'draft',
//               totalVotes: 0,
//               prizePool: 0,
//               winnersCount: 0,
//               drawStatus: 'pending',
//               prizesDistributed: false,
//               lotteryEnabled: election.lottery_enabled === true,
//             };
//           }
//         })
//       );

//       setEnrichedElections(enrichedData.filter(e => e !== null));
//     };

//     fetchLotteryData();
//   }, [electionsData]);

//   const filteredElections = useMemo(() => {
//     return enrichedElections.filter(e => {
//       if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()) && !e.id.toString().includes(searchTerm)) {
//         return false;
//       }
//       return true;
//     });
//   }, [enrichedElections, searchTerm]);

//   const stats = useMemo(() => {
//     const totalPrize = enrichedElections.reduce((sum, e) => sum + (parseFloat(e.prizePool) || 0), 0);
//     const totalVotes = enrichedElections.reduce((sum, e) => sum + (parseInt(e.totalVotes) || 0), 0);

//     return {
//       totalElections: enrichedElections.length,
//       activeElections: enrichedElections.filter(e => e.status === 'active').length,
//       totalPrizePool: totalPrize,
//       totalVotes: totalVotes,
//       failedDraws: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//     };
//   }, [enrichedElections]);

//   const filterCounts = useMemo(() => ({
//     all: enrichedElections.length,
//     active: enrichedElections.filter(e => e.status === 'active').length,
//     ended: enrichedElections.filter(e => e.status === 'ended').length,
//     completed: enrichedElections.filter(e => e.status === 'completed').length,
//     failed: enrichedElections.filter(e => e.drawStatus === 'failed').length,
//   }), [enrichedElections]);

//   const handleManualDraw = async (electionId) => {
//     if (drawLoading) return;
//     if (!confirm('Are you sure you want to trigger a manual lottery draw?')) return;
    
//     try {
//       await triggerDraw(electionId).unwrap();
//       toast.success('Lottery draw completed successfully!');
//       refetch();
//     } catch (error) {
//       console.error('Manual draw error:', error);
//       toast.error(error?.data?.message || 'Failed to trigger lottery draw');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const getDaysUntilDraw = (drawDate) => {
//     if (!drawDate) return null;
//     try {
//       const now = new Date();
//       const draw = new Date(drawDate);
//       const diff = Math.ceil((draw - now) / (1000 * 60 * 60 * 24));
//       return diff;
//     } catch {
//       return null;
//     }
//   };

//   if (electionsError) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
//           <p className="text-red-800 font-semibold mb-2">Error Loading Elections</p>
//           <p className="text-sm text-red-600">{electionsError?.data?.message || electionsError?.message || 'Failed to load elections'}</p>
//           <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   if (electionsLoading || (electionsData && enrichedElections.length === 0 && electionsData.elections.length > 0)) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <TrendingUp className="w-8 h-8 text-purple-600" />
//             Election Statistics & Monitoring
//           </h1>
//           <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//         </div>
        
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//             <p className="text-gray-600">Loading election statistics...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           <TrendingUp className="w-8 h-8 text-purple-600" />
//           Election Statistics & Monitoring
//         </h1>
//         <p className="text-gray-600 mt-2">Comprehensive election oversight, draw management, and prize distribution tracking</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-red-700 font-medium">Failed Draws</p>
//               <p className="text-3xl font-bold text-red-600 mt-1">{stats.failedDraws}</p>
//               <p className="text-xs text-red-600 mt-1">Requires manual intervention</p>
//             </div>
//             <AlertTriangle className="w-10 h-10 text-red-400" />
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-700 font-medium">Total Elections</p>
//               <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalElections}</p>
//               <p className="text-xs text-blue-600 mt-1">{stats.activeElections} active | {stats.totalVotes} total votes</p>
//             </div>
//             <Clock className="w-10 h-10 text-blue-400" />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-700 font-medium">Total Prize Pool</p>
//               <p className="text-2xl font-bold text-green-600 mt-1">
//                 ${(stats.totalPrizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//               </p>
//               <p className="text-xs text-green-600 mt-1">Across all elections</p>
//             </div>
//             <CheckCircle className="w-10 h-10 text-green-400" />
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status</p>
//         <div className="flex flex-wrap gap-2">
//           {[
//             {id:'all', label:'All Elections', count: filterCounts.all},
//             {id:'active', label:'Active', count: filterCounts.active},
//             {id:'ended', label:'Ended', count: filterCounts.ended},
//             {id:'completed', label:'Completed', count: filterCounts.completed},
//             {id:'failed', label:'Failed Draws', count: filterCounts.failed},
//           ].map(f => (
//             <button
//               key={f.id}
//               onClick={() => setFilterStatus(f.id)}
//               className={`px-3 py-1.5 rounded text-sm font-medium transition ${
//                 filterStatus === f.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {f.label} ({f.count})
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-lg shadow p-4">
//         <input
//           type="text"
//           placeholder="Search by name, election ID..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       <p className="text-sm text-gray-600">Showing {filteredElections.length} result{filteredElections.length !== 1 ? 's' : ''}</p>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   <Clock className="inline w-4 h-4 mr-1" />Timeline
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredElections.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center">
//                     <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600 font-medium">No Elections Found</p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {searchTerm ? 'Try adjusting your search' : 'No elections available'}
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredElections.map(e => {
//                   const daysUntilDraw = getDaysUntilDraw(e.drawDate);
                  
//                   return (
//                     <tr key={e.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-xs space-y-1">
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />Start: {formatDate(e.startDate)}
//                           </div>
//                           <div className="flex items-center gap-1 text-gray-600">
//                             <Calendar size={12} />End: {formatDate(e.endDate)}
//                           </div>
//                           {e.lotteryEnabled && e.drawDate && (
//                             <>
//                               <div className="flex items-center gap-1 font-medium text-purple-600">
//                                 <Calendar size={12} />Draw: {formatDate(e.drawDate)}
//                               </div>
//                               {daysUntilDraw !== null && daysUntilDraw > 0 && (
//                                 <div className="text-xs text-gray-500">{daysUntilDraw} days until draw</div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{e.title}</div>
//                         <div className="text-xs text-gray-500">ID: #{e.id}</div>
//                         <span className={`mt-1 inline-block px-2 py-1 rounded text-xs font-medium ${
//                           e.status==='active'?'bg-green-100 text-green-800':
//                           e.status==='completed'?'bg-blue-100 text-blue-800':
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {e.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-xs space-y-1">
//                           <div>Votes: <span className="font-semibold">{e.totalVotes}</span></div>
//                           {e.lotteryEnabled && (
//                             <>
//                               <div>Prize: <span className="font-semibold text-green-600">
//                                 ${(e.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                               </span></div>
//                               <div>Winners: <span className="font-semibold">{e.winnersCount}</span></div>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <div className="space-y-2">
//                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                               e.drawStatus==='pending'?'bg-yellow-100 text-yellow-800':
//                               e.drawStatus==='completed'?'bg-green-100 text-green-800':
//                               'bg-red-100 text-red-800'
//                             }`}>
//                               {e.drawStatus==='pending'&&<Clock size={14}/>}
//                               {e.drawStatus==='completed'&&<CheckCircle size={14}/>}
//                               {e.drawStatus==='failed'&&<AlertTriangle size={14}/>}
//                               {e.drawStatus}
//                             </span>
//                             {e.drawStatus==='failed'&&(
//                               <button
//                                 onClick={() => handleManualDraw(e.id)}
//                                 disabled={drawLoading}
//                                 className="w-full mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
//                               >
//                                 {drawLoading ? <Loader className="animate-spin" size={12} /> : <Play size={12}/>}
//                                 Manual Draw
//                               </button>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-gray-500">No lottery</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {e.lotteryEnabled ? (
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//                             e.prizesDistributed?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {e.prizesDistributed?<CheckCircle size={14}/>:<Clock size={14}/>}
//                             {e.prizesDistributed?'Distributed':'Pending'}
//                           </span>
//                         ) : (
//                           <span className="text-xs text-gray-500">N/A</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => setSelectedElection(e)}
//                           className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-medium"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal */}
//       {selectedElection && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">{selectedElection.title}</h2>
//                 <p className="text-sm text-gray-600 mt-1">Election ID: #{selectedElection.id}</p>
//               </div>
//               <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24}/>
//               </button>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Status</p>
//                   <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.status}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded">
//                   <p className="text-xs text-gray-600">Total Votes</p>
//                   <p className="text-sm font-semibold mt-1">{selectedElection.totalVotes}</p>
//                 </div>
//                 {selectedElection.lotteryEnabled && (
//                   <>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Prize Pool</p>
//                       <p className="text-sm font-semibold text-green-600 mt-1">
//                         ${(selectedElection.prizePool || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
//                       </p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Draw Status</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.drawStatus}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Reward Type</p>
//                       <p className="text-sm font-semibold mt-1 capitalize">{selectedElection.rewardType?.replace('_', ' ')}</p>
//                     </div>
//                     <div className="bg-gray-50 p-3 rounded">
//                       <p className="text-xs text-gray-600">Winners</p>
//                       <p className="text-sm font-semibold mt-1">{selectedElection.winnersCount}</p>
//                     </div>
//                   </>
//                 )}
//               </div>
              
//               <div className="flex gap-3 pt-4 border-t border-gray-200">
//                 {selectedElection.drawStatus === 'failed' && (
//                   <button
//                     onClick={() => {
//                       handleManualDraw(selectedElection.id);
//                       setSelectedElection(null);
//                     }}
//                     disabled={drawLoading}
//                     className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {drawLoading ? <Loader className="animate-spin" size={18} /> : <Play size={18}/>}
//                     Trigger Manual Draw
//                   </button>
//                 )}
//                 <button onClick={() => setSelectedElection(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 font-semibold">Real-Time Data Loaded</p>
//             <p className="text-sm text-blue-700 mt-1">
//               Elections from Election Service • Lottery stats from Voting Service
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }