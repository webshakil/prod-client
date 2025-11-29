import React, { useState } from 'react';
import { useGetAllUsersQuery, useGetUserAnalyticsQuery } from '../../../redux/api/user/userApi';
import Loading from '../../Common/Loading';
import ErrorAlert from '../../Common/ErrorAlert';

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(150);
  const [sortBy, setSortBy] = useState('collected_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery({
    page,
    limit,
    search,
    gender,
    country,
    ageMin,
    ageMax,
    sortBy,
    sortOrder,
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useGetUserAnalyticsQuery(undefined, {
    skip: !showAnalytics,
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || {};
  const analytics = analyticsData?.data || {};

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  // Calculate additional metrics
  const maleCount = analytics.genderDistribution?.find(g => g.gender === 'male')?.count || 0;
  const femaleCount = analytics.genderDistribution?.find(g => g.gender === 'female')?.count || 0;
  const otherCount = analytics.genderDistribution?.reduce((sum, g) => {
    return g.gender !== 'male' && g.gender !== 'female' ? sum + g.count : sum;
  }, 0) || 0;

  const malePercentage = analytics.totalUsers ? ((maleCount / analytics.totalUsers) * 100).toFixed(1) : 0;
  const femalePercentage = analytics.totalUsers ? ((femaleCount / analytics.totalUsers) * 100).toFixed(1) : 0;
  const otherPercentage = analytics.totalUsers ? ((otherCount / analytics.totalUsers) * 100).toFixed(1) : 0;

  if (usersLoading) return <Loading />;
  if (usersError) return <ErrorAlert message={usersError.data?.message || 'Failed to load users'} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            User Management Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Complete analytics and user insights</p>
        </div>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
        >
          {showAnalytics ? (
            <>
              <span>📉</span> Hide Analytics
            </>
          ) : (
            <>
              <span>📊</span> Show Analytics
            </>
          )}
        </button>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="space-y-6 animate-fade-in">
          {/* Primary Stats - Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsLoading ? (
              <div className="col-span-4"><Loading /></div>
            ) : (
              <>
                {/* Total Users Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Users</h3>
                      <div className="text-5xl">👥</div>
                    </div>
                    <div className="text-5xl font-bold mb-2">{analytics.totalUsers || 0}</div>
                    <div className="text-sm opacity-75">Registered members</div>
                  </div>
                </div>

                {/* Male Users Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">Male Users</h3>
                      <div className="text-5xl">👨</div>
                    </div>
                    <div className="text-5xl font-bold mb-2">{maleCount}</div>
                    <div className="text-sm opacity-75">{malePercentage}% of total users</div>
                  </div>
                </div>

                {/* Female Users Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">Female Users</h3>
                      <div className="text-5xl">👩</div>
                    </div>
                    <div className="text-5xl font-bold mb-2">{femaleCount}</div>
                    <div className="text-sm opacity-75">{femalePercentage}% of total users</div>
                  </div>
                </div>

                {/* Average Age Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">Average Age</h3>
                      <div className="text-5xl">🎂</div>
                    </div>
                    <div className="text-5xl font-bold mb-2">{analytics.averageAge || 0}</div>
                    <div className="text-sm opacity-75">Years old</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Countries</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{analytics.countryDistribution?.length || 0}</p>
                </div>
                <div className="text-4xl">🌍</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Languages</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{analytics.languageDistribution?.length || 0}</p>
                </div>
                <div className="text-4xl">🗣️</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-teal-500 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Other Gender</p>
                  <p className="text-3xl font-bold text-teal-600 mt-1">{otherCount}</p>
                </div>
                <div className="text-4xl">⚧️</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Timezones</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{analytics.timezoneDistribution?.length || 0}</p>
                </div>
                <div className="text-4xl">🕐</div>
              </div>
            </div>
          </div>

          {/* Gender Distribution - PIE CHART */}
          {analytics.genderDistribution && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-3xl">⚧️</span> 
                <span>Gender Distribution Overview</span>
              </h3>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* PIE CHART */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-80 h-80">
                    {/* Pie Chart Slices */}
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {analytics.genderDistribution.map((item, index) => {
                        const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'];
                        const totalBefore = analytics.genderDistribution
                          .slice(0, index)
                          .reduce((sum, g) => sum + g.count, 0);
                        const percentage = (item.count / analytics.totalUsers) * 100;
                        const offset = (totalBefore / analytics.totalUsers) * 100;
                        
                        return (
                          <circle
                            key={item.gender}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={colors[index]}
                            strokeWidth="20"
                            strokeDasharray={`${percentage * 2.513} ${251.3 - percentage * 2.513}`}
                            strokeDashoffset={-offset * 2.513}
                            className="hover:stroke-opacity-80 transition-all cursor-pointer"
                            style={{ strokeLinecap: 'round' }}
                          />
                        );
                      })}
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-800">{analytics.totalUsers}</div>
                        <div className="text-sm text-gray-500 font-semibold uppercase mt-1">Total Users</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-8 flex flex-wrap justify-center gap-6">
                    {analytics.genderDistribution.map((item, index) => {
                      const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500'];
                      const percentage = ((item.count / analytics.totalUsers) * 100).toFixed(1);
                      
                      return (
                        <div key={item.gender} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full ${colors[index]} shadow-lg`}></div>
                          <div>
                            <div className="text-sm font-bold text-gray-700 capitalize">{item.gender || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{item.count} ({percentage}%)</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                        <span className="text-lg font-bold text-gray-800">Male</span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">{maleCount}</div>
                        <div className="text-sm text-gray-600">{malePercentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${malePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                        <span className="text-lg font-bold text-gray-800">Female</span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-pink-600">{femaleCount}</div>
                        <div className="text-sm text-gray-600">{femalePercentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-pink-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-1000"
                        style={{ width: `${femalePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-lg font-bold text-gray-800">Other</span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{otherCount}</div>
                        <div className="text-sm text-gray-600">{otherPercentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${otherPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* World Map Style - Country Distribution */}
          {analytics.countryDistribution && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-3xl">🌍</span> 
                <span>Global User Distribution - Top 10 Countries</span>
              </h3>
              <div className="space-y-4">
                {analytics.countryDistribution.map((item, index) => {
                  const maxCount = Math.max(...analytics.countryDistribution.map(c => c.count));
                  const widthPercentage = (item.count / maxCount) * 100;
                  const totalPercentage = ((item.count / analytics.totalUsers) * 100).toFixed(1);
                  
                  const gradients = [
                    'from-blue-500 to-blue-600',
                    'from-indigo-500 to-indigo-600',
                    'from-purple-500 to-purple-600',
                    'from-pink-500 to-pink-600',
                    'from-red-500 to-red-600',
                    'from-orange-500 to-orange-600',
                    'from-yellow-500 to-yellow-600',
                    'from-green-500 to-green-600',
                    'from-teal-500 to-teal-600',
                    'from-cyan-500 to-cyan-600',
                  ];
                  
                  const flags = ['🇦🇪', '🇬🇧', '🇺🇸', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇮🇳', '🇧🇷'];
                  
                  return (
                    <div key={item.country} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{flags[index] || '🌐'}</span>
                          <span className="text-lg font-bold text-gray-800">#{index + 1}</span>
                          <span className="text-lg font-semibold text-gray-700">{item.country}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-800">{item.count}</span>
                          <span className="text-sm text-gray-500 w-16 text-right">{totalPercentage}%</span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                        <div
                          className={`h-6 bg-gradient-to-r ${gradients[index]} rounded-full transition-all duration-1000 ease-out shadow-lg group-hover:shadow-xl flex items-center justify-end pr-4 text-white font-bold text-sm`}
                          style={{ width: `${widthPercentage}%` }}
                        >
                          {widthPercentage > 20 && `${widthPercentage.toFixed(0)}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Age Distribution - Pyramid Chart */}
          {analytics.ageDistribution && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-3xl">📊</span> 
                <span>Age Demographics - Population Pyramid</span>
              </h3>
              <div className="space-y-6">
                {analytics.ageDistribution.map((item, index) => {
                  const maxCount = Math.max(...analytics.ageDistribution.map(a => a.count));
                  const widthPercentage = (item.count / maxCount) * 100;
                  const totalPercentage = ((item.count / analytics.totalUsers) * 100).toFixed(1);
                  
                  const colors = [
                    'from-red-400 to-red-600',
                    'from-orange-400 to-orange-600',
                    'from-yellow-400 to-yellow-600',
                    'from-green-400 to-green-600',
                    'from-teal-400 to-teal-600',
                    'from-blue-400 to-blue-600',
                    'from-indigo-400 to-indigo-600',
                    'from-purple-400 to-purple-600',
                  ];
                  
                  return (
                    <div key={item.age_group} className="group">
                      <div className="flex items-center gap-6 mb-2">
                        <div className="w-24 text-right">
                          <span className="text-xl font-bold text-gray-800">{item.age_group}</span>
                        </div>
                        <div className="flex-1">
                          <div className="relative w-full bg-gray-200 rounded-full h-12 overflow-hidden shadow-inner">
                            <div
                              className={`h-12 bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-1000 ease-out shadow-lg group-hover:shadow-2xl flex items-center justify-between px-6 text-white font-bold`}
                              style={{ width: `${widthPercentage}%` }}
                            >
                              <span className="text-lg">{item.count} users</span>
                              {widthPercentage > 15 && <span className="text-lg">{totalPercentage}%</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Language & Timezone Combined */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Language Bubbles */}
            {analytics.languageDistribution && (
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-3xl">🗣️</span> 
                  <span>Language Breakdown</span>
                </h3>
                <div className="flex flex-wrap gap-6 justify-center min-h-[300px] items-center">
                  {analytics.languageDistribution.map((item, index) => {
                    const size = 80 + (item.count / Math.max(...analytics.languageDistribution.map(l => l.count))) * 120;
                    const percentage = ((item.count / analytics.totalUsers) * 100).toFixed(1);
                    const colors = [
                      'from-blue-400 to-blue-600',
                      'from-green-400 to-green-600',
                      'from-purple-400 to-purple-600',
                      'from-pink-400 to-pink-600',
                      'from-yellow-400 to-yellow-600',
                      'from-red-400 to-red-600',
                      'from-indigo-400 to-indigo-600',
                      'from-teal-400 to-teal-600',
                    ];
                    
                    return (
                      <div
                        key={item.language}
                        className={`bg-gradient-to-br ${colors[index % colors.length]} rounded-full shadow-2xl text-white flex flex-col items-center justify-center transform hover:scale-110 transition-all duration-300 cursor-pointer relative group`}
                        style={{ width: `${size}px`, height: `${size}px` }}
                      >
                        <div className="text-3xl font-bold">{item.count}</div>
                        <div className="text-sm font-semibold uppercase mt-1">{item.language}</div>
                        <div className="text-xs opacity-90 mt-1">{percentage}%</div>
                        
                        {/* Tooltip */}
                        <div className="absolute -top-12 bg-gray-900 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-semibold shadow-xl">
                          {item.count} users speak {item.language}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timezone Distribution */}
            {analytics.timezoneDistribution && (
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-3xl">🕐</span> 
                  <span>Timezone Distribution</span>
                </h3>
                <div className="space-y-3">
                  {analytics.timezoneDistribution.map((item, index) => {
                    const percentage = ((item.count / analytics.totalUsers) * 100).toFixed(1);
                    
                    return (
                      <div key={item.timezone} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-indigo-100 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{item.timezone}</div>
                            <div className="text-sm text-gray-500">{percentage}% of users</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                          {item.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Registration Trend - Area Chart */}
          {analytics.registrationTrend && analytics.registrationTrend.length > 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-3xl">📈</span> 
                <span>Registration Growth - Last 30 Days</span>
              </h3>
              <div className="relative h-80 bg-gradient-to-b from-indigo-50 to-white rounded-xl p-6 border border-indigo-100">
                <div className="absolute inset-6 flex items-end justify-between gap-1">
                  {[...analytics.registrationTrend].reverse().map((item) => {
                    const maxCount = Math.max(...analytics.registrationTrend.map(r => r.count));
                    const heightPercentage = (item.count / maxCount) * 100;
                    
                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center group relative">
                        {/* Bar */}
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 rounded-t-xl transition-all duration-500 hover:from-purple-600 hover:via-purple-500 hover:to-purple-400 shadow-lg hover:shadow-2xl relative overflow-hidden"
                          style={{ height: `${heightPercentage}%` }}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20"></div>
                          
                          {/* Tooltip */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-semibold shadow-2xl z-10">
                            <div className="font-bold text-lg">{item.count} users</div>
                            <div className="text-xs opacity-75">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                          
                          {/* Dot on top */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-lg group-hover:scale-150 transition-transform"></div>
                        </div>
                        
                        {/* Date label */}
                        <div className="text-xs text-gray-500 mt-2 transform rotate-0 group-hover:font-bold transition-all whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Advanced Filters
          </h3>
          <button
            onClick={() => {
              setSearch('');
              setGender('');
              setCountry('');
              setAgeMin(0);
              setAgeMax(150);
              setSortBy('collected_at');
              setSortOrder('DESC');
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
          >
            Reset Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔎 Search by name, country, city..."
            value={search}
            onChange={handleSearch}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="">⚧️ All Genders</option>
            <option value="male">👨 Male</option>
            <option value="female">👩 Female</option>
            <option value="other">⚧️ Other</option>
            <option value="prefer_not_to_say">🤐 Prefer not to say</option>
          </select>
          <input
            type="text"
            placeholder="🌍 Country"
            value={country}
            onChange={(e) => { setCountry(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="📉 Min Age"
              value={ageMin}
              onChange={(e) => { setAgeMin(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition w-1/2"
            />
            <input
              type="number"
              placeholder="📈 Max Age"
              value={ageMax}
              onChange={(e) => { setAgeMax(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition w-1/2"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition flex-1"
          >
            <option value="collected_at">📅 Registration Date</option>
            <option value="first_name">👤 First Name</option>
            <option value="last_name">👤 Last Name</option>
            <option value="age">🎂 Age</option>
            <option value="country">🌍 Country</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition flex-1"
          >
            <option value="DESC">⬇️ Descending</option>
            <option value="ASC">⬆️ Ascending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> User Database ({pagination.total || 0} users)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Age</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Gender</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Location</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Language</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">IP Address</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-xl font-semibold">No users found</div>
                    <div className="text-sm mt-2">Try adjusting your filters</div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.user_id} className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-200 px-3 py-1 rounded-full">{user.user_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{user.first_name} {user.last_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{user.age}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">{user.gender}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-semibold">{user.city}</div>
                      <div className="text-xs text-gray-500">{user.country}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold uppercase">{user.language}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.registration_ip}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.collected_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-lg gap-4 border border-gray-200">
          <div className="text-sm text-gray-600 font-semibold">
            Showing <span className="text-indigo-600 font-bold">{users.length}</span> of <span className="text-indigo-600 font-bold">{pagination.total}</span> users
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              ← Previous
            </button>
            <span className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2">
              <span>{page}</span>
              <span className="opacity-75">/</span>
              <span>{pagination.totalPages}</span>
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Next →
            </button>
          </div>
          <select
            value={limit}
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-semibold"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      )}
    </div>
  );
}
// import React, { useState } from 'react';
// //import { useGetAllUsersQuery, useGetUserAnalyticsQuery } from '../../redux/api/user/userApi';
// //import Loading from '../Common/Loading';
// //import ErrorAlert from '../Common/ErrorAlert';
// import { useGetAllUsersQuery, useGetUserAnalyticsQuery } from '../../../redux/api/user/userApi';
// import Loading from '../../Common/Loading';
// import ErrorAlert from '../../Common/ErrorAlert';

// export default function UserManagement() {
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(20);
//   const [search, setSearch] = useState('');
//   const [gender, setGender] = useState('');
//   const [country, setCountry] = useState('');
//   const [ageMin, setAgeMin] = useState(0);
//   const [ageMax, setAgeMax] = useState(150);
//   const [sortBy, setSortBy] = useState('collected_at');
//   const [sortOrder, setSortOrder] = useState('DESC');
//   const [showAnalytics, setShowAnalytics] = useState(false);

//   // Fetch users
//   const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery({
//     page,
//     limit,
//     search,
//     gender,
//     country,
//     ageMin,
//     ageMax,
//     sortBy,
//     sortOrder,
//   });

//   // Fetch analytics
//   const { data: analyticsData, isLoading: analyticsLoading } = useGetUserAnalyticsQuery(undefined, {
//     skip: !showAnalytics,
//   });

//   const users = usersData?.data?.users || [];
//   const pagination = usersData?.data?.pagination || {};
//   const analytics = analyticsData?.data || {};

//   const handleSearch = (e) => {
//     setSearch(e.target.value);
//     setPage(1); // Reset to first page
//   };

//   const handleFilterChange = () => {
//     setPage(1); // Reset to first page when filters change
//   };

//   if (usersLoading) return <Loading />;
//   if (usersError) return <ErrorAlert message={usersError.data?.message || 'Failed to load users'} />;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">User Management</h1>
//         <button
//           onClick={() => setShowAnalytics(!showAnalytics)}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//         >
//           {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
//         </button>
//       </div>

//       {/* Analytics Section */}
//       {showAnalytics && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {analyticsLoading ? (
//             <Loading />
//           ) : (
//             <>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
//                 <p className="text-3xl font-bold text-indigo-600 mt-2">{analytics.totalUsers || 0}</p>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Average Age</h3>
//                 <p className="text-3xl font-bold text-green-600 mt-2">{analytics.averageAge || 0}</p>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Countries</h3>
//                 <p className="text-3xl font-bold text-blue-600 mt-2">
//                   {analytics.countryDistribution?.length || 0}
//                 </p>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Languages</h3>
//                 <p className="text-3xl font-bold text-purple-600 mt-2">
//                   {analytics.languageDistribution?.length || 0}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* Gender Distribution Chart */}
//       {showAnalytics && analytics.genderDistribution && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
//           <div className="space-y-2">
//             {analytics.genderDistribution.map((item) => (
//               <div key={item.gender} className="flex items-center justify-between">
//                 <span className="text-sm font-medium capitalize">{item.gender || 'Unknown'}</span>
//                 <div className="flex items-center gap-2">
//                   <div className="w-64 bg-gray-200 rounded-full h-4">
//                     <div
//                       className="bg-indigo-600 h-4 rounded-full"
//                       style={{ width: `${(item.count / analytics.totalUsers) * 100}%` }}
//                     />
//                   </div>
//                   <span className="text-sm text-gray-600">{item.count}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Country Distribution */}
//       {showAnalytics && analytics.countryDistribution && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Top 10 Countries</h3>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {analytics.countryDistribution.map((item) => (
//               <div key={item.country} className="text-center">
//                 <div className="text-2xl font-bold text-indigo-600">{item.count}</div>
//                 <div className="text-sm text-gray-600">{item.country}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Age Distribution */}
//       {showAnalytics && analytics.ageDistribution && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {analytics.ageDistribution.map((item) => (
//               <div key={item.age_group} className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">{item.count}</div>
//                 <div className="text-sm text-gray-600">{item.age_group}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white p-6 rounded-lg shadow space-y-4">
//         <h3 className="text-lg font-semibold">Filters</h3>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <input
//             type="text"
//             placeholder="Search by name, country, city..."
//             value={search}
//             onChange={handleSearch}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           <select
//             value={gender}
//             onChange={(e) => { setGender(e.target.value); handleFilterChange(); }}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">All Genders</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//             <option value="other">Other</option>
//             <option value="prefer_not_to_say">Prefer not to say</option>
//           </select>
//           <input
//             type="text"
//             placeholder="Country"
//             value={country}
//             onChange={(e) => { setCountry(e.target.value); handleFilterChange(); }}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           <div className="flex gap-2">
//             <input
//               type="number"
//               placeholder="Min Age"
//               value={ageMin}
//               onChange={(e) => { setAgeMin(e.target.value); handleFilterChange(); }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-1/2"
//             />
//             <input
//               type="number"
//               placeholder="Max Age"
//               value={ageMax}
//               onChange={(e) => { setAgeMax(e.target.value); handleFilterChange(); }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-1/2"
//             />
//           </div>
//         </div>
//         <div className="flex gap-4">
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="collected_at">Registration Date</option>
//             <option value="first_name">First Name</option>
//             <option value="last_name">Last Name</option>
//             <option value="age">Age</option>
//             <option value="country">Country</option>
//           </select>
//           <select
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="DESC">Descending</option>
//             <option value="ASC">Ascending</option>
//           </select>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">User ID</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Age</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Gender</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Language</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">IP Address</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Registered</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
//                     No users found
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((user) => (
//                   <tr key={user.user_id} className="border-b hover:bg-gray-50">
//                     <td className="px-6 py-4 text-sm font-mono">{user.user_id}</td>
//                     <td className="px-6 py-4 text-sm font-semibold">
//                       {user.first_name} {user.last_name}
//                     </td>
//                     <td className="px-6 py-4 text-sm">{user.age}</td>
//                     <td className="px-6 py-4 text-sm capitalize">{user.gender}</td>
//                     <td className="px-6 py-4 text-sm">
//                       {user.city}, {user.country}
//                     </td>
//                     <td className="px-6 py-4 text-sm">{user.language}</td>
//                     <td className="px-6 py-4 text-sm font-mono text-xs">{user.registration_ip}</td>
//                     <td className="px-6 py-4 text-sm">
//                       {new Date(user.collected_at).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
//           <div className="text-sm text-gray-600">
//             Showing {users.length} of {pagination.total} users
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage(Math.max(1, page - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">
//               {page} / {pagination.totalPages}
//             </span>
//             <button
//               onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
//               disabled={page === pagination.totalPages}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               Next
//             </button>
//           </div>
//           <select
//             value={limit}
//             onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="10">10 per page</option>
//             <option value="20">20 per page</option>
//             <option value="50">50 per page</option>
//             <option value="100">100 per page</option>
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState } from 'react';
// //import { useGetAllUsersQuery, useGetUserAnalyticsQuery } from '../../redux/api/user/userApi';
// //import Loading from '../Common/Loading';
// //import ErrorAlert from '../Common/ErrorAlert';
// import { useGetAllUsersQuery, useGetUserAnalyticsQuery } from '../../../redux/api/user/userApi';
// import Loading from '../../Common/Loading';
// import ErrorAlert from '../../Common/ErrorAlert';

// export default function UserManagement() {
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(20);
//   const [search, setSearch] = useState('');
//   const [gender, setGender] = useState('');
//   const [country, setCountry] = useState('');
//   const [ageMin, setAgeMin] = useState(0);
//   const [ageMax, setAgeMax] = useState(150);
//   const [sortBy, setSortBy] = useState('collected_at');
//   const [sortOrder, setSortOrder] = useState('DESC');
//   const [showAnalytics, setShowAnalytics] = useState(false);

//   // Fetch users
//   const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery({
//     page,
//     limit,
//     search,
//     gender,
//     country,
//     ageMin,
//     ageMax,
//     sortBy,
//     sortOrder,
//   });

//   // Fetch analytics
//   const { data: analyticsData, isLoading: analyticsLoading } = useGetUserAnalyticsQuery(undefined, {
//     skip: !showAnalytics,
//   });

//   const users = usersData?.data?.users || [];
//   const pagination = usersData?.data?.pagination || {};
//   const analytics = analyticsData?.data || {};

//   const handleSearch = (e) => {
//     setSearch(e.target.value);
//     setPage(1); // Reset to first page
//   };

//   const handleFilterChange = () => {
//     setPage(1); // Reset to first page when filters change
//   };

//   if (usersLoading) return <Loading />;
//   if (usersError) return <ErrorAlert message={usersError.data?.message || 'Failed to load users'} />;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">User Management</h1>
//         <button
//           onClick={() => setShowAnalytics(!showAnalytics)}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//         >
//           {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
//         </button>
//       </div>

//       {/* Analytics Section */}
//       {showAnalytics && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {analyticsLoading ? (
//             <Loading />
//           ) : (
//             <>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
//                 <p className="text-3xl font-bold text-indigo-600 mt-2">{analytics.totalUsers || 0}</p>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Average Age</h3>
//                 <p className="text-3xl font-bold text-green-600 mt-2">{analytics.averageAge || 0}</p>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Countries</h3>
//                 <p className="text-3xl font-bold text-blue-600 mt-2">
//                   {analytics.countryDistribution?.length || 0}
//                 </p>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h3 className="text-sm font-medium text-gray-600">Languages</h3>
//                 <p className="text-3xl font-bold text-purple-600 mt-2">
//                   {analytics.languageDistribution?.length || 0}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* Gender Distribution Chart */}
//       {showAnalytics && analytics.genderDistribution && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
//           <div className="space-y-2">
//             {analytics.genderDistribution.map((item) => (
//               <div key={item.gender} className="flex items-center justify-between">
//                 <span className="text-sm font-medium capitalize">{item.gender || 'Unknown'}</span>
//                 <div className="flex items-center gap-2">
//                   <div className="w-64 bg-gray-200 rounded-full h-4">
//                     <div
//                       className="bg-indigo-600 h-4 rounded-full"
//                       style={{ width: `${(item.count / analytics.totalUsers) * 100}%` }}
//                     />
//                   </div>
//                   <span className="text-sm text-gray-600">{item.count}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Country Distribution */}
//       {showAnalytics && analytics.countryDistribution && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Top 10 Countries</h3>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {analytics.countryDistribution.map((item) => (
//               <div key={item.country} className="text-center">
//                 <div className="text-2xl font-bold text-indigo-600">{item.count}</div>
//                 <div className="text-sm text-gray-600">{item.country}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Age Distribution */}
//       {showAnalytics && analytics.ageDistribution && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {analytics.ageDistribution.map((item) => (
//               <div key={item.age_group} className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">{item.count}</div>
//                 <div className="text-sm text-gray-600">{item.age_group}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white p-6 rounded-lg shadow space-y-4">
//         <h3 className="text-lg font-semibold">Filters</h3>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <input
//             type="text"
//             placeholder="Search by name, country, city..."
//             value={search}
//             onChange={handleSearch}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           <select
//             value={gender}
//             onChange={(e) => { setGender(e.target.value); handleFilterChange(); }}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">All Genders</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//             <option value="other">Other</option>
//             <option value="prefer_not_to_say">Prefer not to say</option>
//           </select>
//           <input
//             type="text"
//             placeholder="Country"
//             value={country}
//             onChange={(e) => { setCountry(e.target.value); handleFilterChange(); }}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           <div className="flex gap-2">
//             <input
//               type="number"
//               placeholder="Min Age"
//               value={ageMin}
//               onChange={(e) => { setAgeMin(e.target.value); handleFilterChange(); }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-1/2"
//             />
//             <input
//               type="number"
//               placeholder="Max Age"
//               value={ageMax}
//               onChange={(e) => { setAgeMax(e.target.value); handleFilterChange(); }}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-1/2"
//             />
//           </div>
//         </div>
//         <div className="flex gap-4">
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="collected_at">Registration Date</option>
//             <option value="first_name">First Name</option>
//             <option value="last_name">Last Name</option>
//             <option value="age">Age</option>
//             <option value="country">Country</option>
//           </select>
//           <select
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="DESC">Descending</option>
//             <option value="ASC">Ascending</option>
//           </select>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">User ID</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Age</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Gender</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Language</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">IP Address</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Registered</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
//                     No users found
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((user) => (
//                   <tr key={user.user_id} className="border-b hover:bg-gray-50">
//                     <td className="px-6 py-4 text-sm font-mono">{user.user_id}</td>
//                     <td className="px-6 py-4 text-sm font-semibold">
//                       {user.first_name} {user.last_name}
//                     </td>
//                     <td className="px-6 py-4 text-sm">{user.age}</td>
//                     <td className="px-6 py-4 text-sm capitalize">{user.gender}</td>
//                     <td className="px-6 py-4 text-sm">
//                       {user.city}, {user.country}
//                     </td>
//                     <td className="px-6 py-4 text-sm">{user.language}</td>
//                     <td className="px-6 py-4 text-sm font-mono text-xs">{user.registration_ip}</td>
//                     <td className="px-6 py-4 text-sm">
//                       {new Date(user.collected_at).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
//           <div className="text-sm text-gray-600">
//             Showing {users.length} of {pagination.total} users
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage(Math.max(1, page - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">
//               {page} / {pagination.totalPages}
//             </span>
//             <button
//               onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
//               disabled={page === pagination.totalPages}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               Next
//             </button>
//           </div>
//           <select
//             value={limit}
//             onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="10">10 per page</option>
//             <option value="20">20 per page</option>
//             <option value="50">50 per page</option>
//             <option value="100">100 per page</option>
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }
