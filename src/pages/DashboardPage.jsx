// src/pages/DashboardPage.jsx - UPDATED WITH NOTIFICATION BELL
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { useGetProfileMutation } from '../redux/api/user/userApi';
import { useAuth } from '../redux/hooks';
import { Loader } from 'lucide-react';
import { useGetUserRolesQuery } from '../redux/api/role/roleApi';

// ✅ Import Notification Components
import NotificationBell from '../components/notifications/NotificationBell';
import { useNotificationMonitor } from '../hooks/useNotificationMonitor';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // ✅ Initialize notification monitoring
  useNotificationMonitor();

  const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
    skip: !auth.userId,
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  /*eslint-disable*/
  const [profileError, setProfileError] = useState(null);

  const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

  const currentUser = useMemo(() => {
    const profile = profileData?.profile || {};
    const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
    return {
      user_firstname: profile.user_firstname || auth.firstName || 'User',
      user_lastname: profile.user_lastname || auth.lastName || '',
      user_email: profile.user_email || auth.email || '',
      user_id: profile.user_id || auth.userId,
      roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
    };
  }, [profileData, liveRolesData, auth]);

  const isAdminRoute = location.pathname.includes('/dashboard/admin');

  const tabs = useMemo(() => {
    let roles = currentUser?.roles || ['Voter'];

    if (!Array.isArray(roles)) {
      roles = Object.values(roles);
    }

    const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

    const isManager = normalizedRoles.includes('manager');
    const isAdmin = normalizedRoles.includes('admin');
    /*eslint-disable*/
    const isContentCreator = normalizedRoles.includes('contentcreator');
    const isModerator = normalizedRoles.includes('moderator');
    
    const canCreateElections = normalizedRoles.some(role => 
      role.includes('electioncreator') ||
      role.includes('organizationelectioncreator') ||
      role.includes('contentcreator')
    );

    const tabsList = [];

    tabsList.push({
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
    });
    
    tabsList.push({
      path: '/dashboard/public-bulletin',
      label: 'Public Bulletin',
      icon: '🌐',
    });

    tabsList.push({
      path: '/dashboard/vote-now',
      label: 'Vote Now',
      icon: '🗳️',
    });

    tabsList.push({
      path: '/dashboard/vote-history',
      label: 'My Votes',
      icon: '📜',
    });

    tabsList.push({
      path: '/dashboard/all-elections',
      label: 'All Elections',
      icon: '📋',
    });

    if (canCreateElections) {
      tabsList.push({
        path: '/dashboard/my-elections',
        label: 'My Elections',
        icon: '📁',
      });
    }

    tabsList.push({
      path: '/dashboard/wallet',
      label: 'My Wallet',
      icon: '💰',
    });

    if (canCreateElections) {
      tabsList.push({
        path: '/dashboard/creator-wallet',
        label: 'Creator Wallet',
        icon: '💵',
      });
    }

    tabsList.push({
      path: '/dashboard/lottery',
      label: 'Gamified Election Tickets',
      icon: '🎰',
    });

    tabsList.push({
      path: '/dashboard/subscription',
      label: 'Subscriptions',
      icon: '💳',
    });

    tabsList.push({
      path: '/dashboard/create-election',
      label: 'Create Election',
      icon: '➕',
    });

    if (isModerator || isAdmin || isManager) {
      tabsList.push({
        path: '/dashboard/verify-votes',
        label: 'Verify Votes',
        icon: '✓',
      });
    }

    if (isAdmin || isManager) {
      tabsList.push({
        path: '/dashboard/user-management',
        label: 'User Management',
        icon: '👥',
      });

      tabsList.push({
        path: '/dashboard/audit-trail',
        label: 'Audit Trail',
        icon: '📝',
      });
    }

    return tabsList;
  }, [currentUser?.roles]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to auth');
      navigate('/auth', { replace: true });
      return;
    }
    console.log('✅ User authenticated:', { 
      reduxAuth: auth.isAuthenticated,
      hasTokenInStorage: !!accessToken,
      userId: userId || auth.userId,
      email: auth.email 
    });
  }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

  useEffect(() => {
    if (auth.userId && !profileLoaded) {
      console.log('📤 Loading user profile for userId:', auth.userId);
      getProfile(auth.userId)
        .then((result) => {
          console.log('✅ Profile loaded:', result);
          setProfileLoaded(true);
          setProfileError(null);
        })
        .catch((error) => {
          console.error('❌ Profile load error:', error);
          setProfileError(error?.data?.message || 'Failed to load profile');
          setProfileLoaded(true);
        });
    }
  }, [auth.userId, profileLoaded, getProfile]);

  useEffect(() => {
    if (location.state?.activeTab) {
      console.log('🔄 Navigation request to tab:', location.state.activeTab);
      
      const tabPathMap = {
        'creator-wallet': '/dashboard/creator-wallet',
        'wallet': '/dashboard/wallet',
        'my-wallet': '/dashboard/wallet',
        'my-elections': '/dashboard/my-elections',
        'dashboard': '/dashboard',
      };

      const targetPath = tabPathMap[location.state.activeTab];
      
      if (targetPath) {
        console.log('✅ Navigating to:', targetPath);
        
        navigate(targetPath, { 
          replace: true,
          state: {
            highlightElection: location.state.highlightElection,
            depositRequired: location.state.depositRequired,
            depositAmount: location.state.depositAmount
          }
        });
      } else {
        console.warn('⚠️ Unknown tab:', location.state.activeTab);
      }
    }
  }, [location.state, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth', { replace: true });
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  if (!profileLoaded && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  let roles = currentUser?.roles || ['Voter'];
  if (!Array.isArray(roles)) {
    roles = Object.values(roles);
  }
  const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
  const isManager = normalizedRoles.includes('manager');
  const isAdmin = normalizedRoles.includes('admin');
  const isAuditor = normalizedRoles.includes('auditor');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navbar */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
          </div>
          
          {/* ✅ RIGHT SIDE: User Info + Notification Bell + Profile + Logout */}
          <div className="flex gap-2 sm:gap-4 items-center">
            {/* User Avatar & Name */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser?.user_firstname?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium hidden md:inline">
                {currentUser?.user_firstname || 'User'}
              </span>
            </div>

            {/* ✅ NOTIFICATION BELL */}
            <NotificationBell />
            
            {/* Profile Button */}
            <button
              onClick={handleGoToProfile}
              className="px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
            >
              Profile 
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
        >
          {/* User Card */}
          <div className="p-4 border-b border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {currentUser?.user_firstname?.[0] || 'U'}
                {currentUser?.user_lastname?.[0] || ''}
              </div>
              <h3 className="font-bold text-sm">
                {currentUser?.user_firstname} {currentUser?.user_lastname}
              </h3>
              <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
                  <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.path}
                  onClick={() => {
                    navigate(tab.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm md:text-base">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ✅ ADMIN Section */}
          {isManager && (
            <>
              <div className="mt-6 pt-4 px-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/subscription');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/subscription'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-sm md:text-base">Subscription Admin</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/roles');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/roles'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🛡️</span>
                  <span className="text-sm md:text-base">Role Management</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/permissions');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/permissions'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🔐</span>
                  <span className="text-sm md:text-base">Permissions</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/user-roles');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/user-roles'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">👤</span>
                  <span className="text-sm md:text-base">User Roles</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/role-history');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/role-history'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">📋</span>
                  <span className="text-sm md:text-base">Role History</span>
                </button>
              </nav>
            </>
          )}

          {/* ✅ SECURITY & AUDIT Section */}
          {(isManager || isAdmin || isAuditor) && (
            <>
              <div className="mt-6 pt-4 px-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 font-semibold uppercase">Security & Audit</p>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/vote-audit');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/vote-audit'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🔍</span>
                  <span className="text-sm md:text-base">Vote Audit</span>
                </button>
                <button
  onClick={() => { navigate('/dashboard/admin/election-stats'); setSidebarOpen(false); }}
  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
    location.pathname === '/dashboard/admin/election-stats' ? 'bg-purple-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <span className="text-lg">📊</span>
  <span className="text-sm md:text-base">Election Stats</span>
</button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/security-logs');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/security-logs'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🔐</span>
                  <span className="text-sm md:text-base">Security Logs</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/system-audit');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/system-audit'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">📝</span>
                  <span className="text-sm md:text-base">System Audit</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/encryption-status');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/encryption-status'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🛡️</span>
                  <span className="text-sm md:text-base">Encryption Status</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/verification-tools');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/verification-tools'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">✓</span>
                  <span className="text-sm md:text-base">Verification Tools</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/compliance-reports');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/compliance-reports'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">📊</span>
                  <span className="text-sm md:text-base">Compliance Reports</span>
                </button>
              </nav>
            </>
          )}

          {/* ✅ FINANCIAL MANAGEMENT Section */}
          {isManager && (
            <>
              <div className="mt-6 pt-4 px-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 font-semibold uppercase">Financial Management</p>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/payment-gateways');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/payment-gateways'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">💳</span>
                  <span className="text-sm md:text-base">Payment Gateways</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/transaction-monitoring');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/transaction-monitoring'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">💰</span>
                  <span className="text-sm md:text-base">Transaction Monitoring</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/revenue-analytics');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/revenue-analytics'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">📈</span>
                  <span className="text-sm md:text-base">Revenue Analytics</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/prize-distribution');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/prize-distribution'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🎁</span>
                  <span className="text-sm md:text-base">Prize Distribution</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/regional-pricing');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/regional-pricing'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🌍</span>
                  <span className="text-sm md:text-base">Regional Pricing</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/refund-management');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/refund-management'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">↩️</span>
                  <span className="text-sm md:text-base">Refund Management</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard/admin/financial-reports');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                    location.pathname === '/dashboard/admin/financial-reports'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">📊</span>
                  <span className="text-sm md:text-base">Financial Reports</span>
                </button>
              </nav>
            </>
          )}

          {/* Stats Section */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Elections Created</p>
              <p className="text-2xl font-bold text-green-600">3</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {profileError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  Warning: {profileError}. Continuing with basic user data.
                </p>
              </div>
            )}
            
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
//last workable perfect code. just to add notificatin above code
// // src/pages/DashboardPage.jsx - COMPLETE WITH ALL ADMIN SECTIONS
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   const isAdminRoute = location.pathname.includes('/dashboard/admin');

//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') ||
//       role.includes('organizationelectioncreator') ||
//       role.includes('contentcreator')
//     );

//     const tabsList = [];

//     tabsList.push({
//       path: '/dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//     });
    
//     tabsList.push({
//       path: '/dashboard/public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//     });

//     tabsList.push({
//       path: '/dashboard/vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//     });

//     tabsList.push({
//       path: '/dashboard/vote-history',
//       label: 'My Votes',
//       icon: '📜',
//     });

//     tabsList.push({
//       path: '/dashboard/all-elections',
//       label: 'All Elections',
//       icon: '📋',
//     });

//     if (canCreateElections) {
//       tabsList.push({
//         path: '/dashboard/my-elections',
//         label: 'My Elections',
//         icon: '📁',
//       });
//     }

//     tabsList.push({
//       path: '/dashboard/wallet',
//       label: 'My Wallet',
//       icon: '💰',
//     });

//     if (canCreateElections) {
//       tabsList.push({
//         path: '/dashboard/creator-wallet',
//         label: 'Creator Wallet',
//         icon: '💵',
//       });
//     }

//     tabsList.push({
//       path: '/dashboard/lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//     });

//     tabsList.push({
//       path: '/dashboard/subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//     });

//     tabsList.push({
//       path: '/dashboard/create-election',
//       label: 'Create Election',
//       icon: '➕',
//     });

//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         path: '/dashboard/verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//       });
//     }

//     if (isAdmin || isManager) {
//       tabsList.push({
//         path: '/dashboard/user-management',
//         label: 'User Management',
//         icon: '👥',
//       });

//       tabsList.push({
//         path: '/dashboard/audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]);

//   useEffect(() => {
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   // ✅✅✅ NEW: HANDLE REDIRECT TO SPECIFIC TAB ✅✅✅
//   useEffect(() => {
//     if (location.state?.activeTab) {
//       console.log('🔄 Navigation request to tab:', location.state.activeTab);
      
//       const tabPathMap = {
//         'creator-wallet': '/dashboard/creator-wallet',
//         'wallet': '/dashboard/wallet',
//         'my-wallet': '/dashboard/wallet',
//         'my-elections': '/dashboard/my-elections',
//         'dashboard': '/dashboard',
//       };

//       const targetPath = tabPathMap[location.state.activeTab];
      
//       if (targetPath) {
//         console.log('✅ Navigating to:', targetPath);
        
//         navigate(targetPath, { 
//           replace: true,
//           state: {
//             highlightElection: location.state.highlightElection,
//             depositRequired: location.state.depositRequired,
//             depositAmount: location.state.depositAmount
//           }
//         });
//       } else {
//         console.warn('⚠️ Unknown tab:', location.state.activeTab);
//       }
//     }
//   }, [location.state, navigate]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');
//   const isAdmin = normalizedRoles.includes('admin');
//   const isAuditor = normalizedRoles.includes('auditor');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile 
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => {
//               const isActive = location.pathname === tab.path;
              
//               return (
//                 <button
//                   key={tab.path}
//                   onClick={() => {
//                     navigate(tab.path);
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     isActive
//                       ? 'bg-blue-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">{tab.icon}</span>
//                   <span className="text-sm md:text-base">{tab.label}</span>
//                 </button>
//               );
//             })}
//           </nav>

//           {/* ✅ ADMIN Section */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/subscription'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/roles'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/permissions'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/user-roles'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/role-history'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ SECURITY & AUDIT Section */}
//           {(isManager || isAdmin || isAuditor) && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Security & Audit</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/vote-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/vote-audit'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔍</span>
//                   <span className="text-sm md:text-base">Vote Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/security-logs');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/security-logs'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Security Logs</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/system-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/system-audit'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📝</span>
//                   <span className="text-sm md:text-base">System Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/encryption-status');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/encryption-status'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Encryption Status</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/verification-tools');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/verification-tools'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">✓</span>
//                   <span className="text-sm md:text-base">Verification Tools</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/compliance-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/compliance-reports'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Compliance Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ FINANCIAL MANAGEMENT Section */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Financial Management</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/payment-gateways');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/payment-gateways'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">💳</span>
//                   <span className="text-sm md:text-base">Payment Gateways</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/transaction-monitoring');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/transaction-monitoring'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">💰</span>
//                   <span className="text-sm md:text-base">Transaction Monitoring</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/revenue-analytics');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/revenue-analytics'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📈</span>
//                   <span className="text-sm md:text-base">Revenue Analytics</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/prize-distribution');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/prize-distribution'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🎁</span>
//                   <span className="text-sm md:text-base">Prize Distribution</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/regional-pricing');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/regional-pricing'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🌍</span>
//                   <span className="text-sm md:text-base">Regional Pricing</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/refund-management');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/refund-management'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">↩️</span>
//                   <span className="text-sm md:text-base">Refund Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/financial-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/financial-reports'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Financial Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
            
//             <Outlet />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
//last workable code
// // src/pages/DashboardPage.jsx - COMPLETE WITH ALL ADMIN SECTIONS
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   const isAdminRoute = location.pathname.includes('/dashboard/admin');

//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') ||
//       role.includes('organizationelectioncreator') ||
//       role.includes('contentcreator')
//     );

//     const tabsList = [];

//     tabsList.push({
//       path: '/dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//     });
    
//     tabsList.push({
//       path: '/dashboard/public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//     });

//     tabsList.push({
//       path: '/dashboard/vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//     });

//     tabsList.push({
//       path: '/dashboard/vote-history',
//       label: 'My Votes',
//       icon: '📜',
//     });

//     tabsList.push({
//       path: '/dashboard/all-elections',
//       label: 'All Elections',
//       icon: '📋',
//     });

//     if (canCreateElections) {
//       tabsList.push({
//         path: '/dashboard/my-elections',
//         label: 'My Elections',
//         icon: '📁',
//       });
//     }

//     tabsList.push({
//       path: '/dashboard/wallet',
//       label: 'My Wallet',
//       icon: '💰',
//     });

//     if (canCreateElections) {
//       tabsList.push({
//         path: '/dashboard/creator-wallet',
//         label: 'Creator Wallet',
//         icon: '💵',
//       });
//     }

//     tabsList.push({
//       path: '/dashboard/lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//     });

//     tabsList.push({
//       path: '/dashboard/subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//     });

//     tabsList.push({
//       path: '/dashboard/create-election',
//       label: 'Create Election',
//       icon: '➕',
//     });

//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         path: '/dashboard/verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//       });
//     }

//     if (isAdmin || isManager) {
//       tabsList.push({
//         path: '/dashboard/user-management',
//         label: 'User Management',
//         icon: '👥',
//       });

//       tabsList.push({
//         path: '/dashboard/audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]);

//   useEffect(() => {
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');
//   const isAdmin = normalizedRoles.includes('admin');
//   const isAuditor = normalizedRoles.includes('auditor');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => {
//               const isActive = location.pathname === tab.path;
              
//               return (
//                 <button
//                   key={tab.path}
//                   onClick={() => {
//                     navigate(tab.path);
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     isActive
//                       ? 'bg-blue-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">{tab.icon}</span>
//                   <span className="text-sm md:text-base">{tab.label}</span>
//                 </button>
//               );
//             })}
//           </nav>

//           {/* ✅ ADMIN Section */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/subscription'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/roles'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/permissions'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/user-roles'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/role-history'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ SECURITY & AUDIT Section */}
//           {(isManager || isAdmin || isAuditor) && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Security & Audit</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/vote-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/vote-audit'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔍</span>
//                   <span className="text-sm md:text-base">Vote Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/security-logs');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/security-logs'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Security Logs</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/system-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/system-audit'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📝</span>
//                   <span className="text-sm md:text-base">System Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/encryption-status');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/encryption-status'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Encryption Status</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/verification-tools');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/verification-tools'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">✓</span>
//                   <span className="text-sm md:text-base">Verification Tools</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/compliance-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/compliance-reports'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Compliance Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ FINANCIAL MANAGEMENT Section */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Financial Management</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/payment-gateways');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/payment-gateways'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">💳</span>
//                   <span className="text-sm md:text-base">Payment Gateways</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/transaction-monitoring');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/transaction-monitoring'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">💰</span>
//                   <span className="text-sm md:text-base">Transaction Monitoring</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/revenue-analytics');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/revenue-analytics'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📈</span>
//                   <span className="text-sm md:text-base">Revenue Analytics</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/prize-distribution');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/prize-distribution'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🎁</span>
//                   <span className="text-sm md:text-base">Prize Distribution</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/regional-pricing');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/regional-pricing'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🌍</span>
//                   <span className="text-sm md:text-base">Regional Pricing</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/refund-management');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/refund-management'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">↩️</span>
//                   <span className="text-sm md:text-base">Refund Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/financial-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/financial-reports'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Financial Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
            
//             <Outlet />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
//last workable code only to make sure everything will come through rotues so above code
// // src/pages/DashboardPage.jsx - COMPLETE FILE WITH OUTLET SUPPORT
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams, Outlet, useLocation } from 'react-router-dom'; // ✅ Added Outlet, useLocation
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';

// // Import NEW voting-related tab components
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';
// import CreatorWallet from '../components/Dashboard/Tabs/wallet/CreatorWallet';

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';
// import MyElections from '../components/Dashboard/Tabs/election/MyElections';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const location = useLocation(); // ✅ NEW
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   useEffect(() => {
//     const tabFromUrl = searchParams.get('tab');
//     if (tabFromUrl) {
//       setActiveTab(tabFromUrl);
//     }
//   }, [searchParams]);

//   // ✅ NEW: Detect if we're on an admin route
//   const isAdminRoute = location.pathname.startsWith('/dashboard/admin');

//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') ||
//       role.includes('organizationelectioncreator') ||
//       role.includes('contentcreator')
//     );

//     const tabsList = [];

//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     if (canCreateElections) {
//       tabsList.push({
//         id: 'my-elections',
//         label: 'My Elections',
//         icon: '📁',
//         component: MyElections,
//       });
//     }

//     tabsList.push({
//       id: 'wallet',
//       label: 'My Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     if (canCreateElections) {
//       tabsList.push({
//         id: 'creator-wallet',
//         label: 'Creator Wallet',
//         icon: '💵',
//         component: CreatorWallet,
//       });
//     }

//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     tabsList.push({
//       id: 'create-election',
//       label: 'Create Election',
//       icon: '➕',
//       component: CreateElection,
//     });

//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]);

//   useEffect(() => {
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//     isAdminRoute, // ✅ NEW
//   });

//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');
//   const isAdmin = normalizedRoles.includes('admin');
//   const isAuditor = normalizedRoles.includes('auditor');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                   // ✅ Navigate to dashboard root when clicking regular tabs
//                   if (isAdminRoute) {
//                     navigate('/dashboard');
//                   }
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id && !isAdminRoute
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* ✅ ADMIN Section */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/subscription'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/roles'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/permissions'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/user-roles'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/role-history'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ SECURITY & AUDIT Section */}
//           {(isManager || isAdmin || isAuditor) && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Security & Audit</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/vote-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/vote-audit'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔍</span>
//                   <span className="text-sm md:text-base">Vote Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/security-logs');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/security-logs'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Security Logs</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/system-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/system-audit'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📝</span>
//                   <span className="text-sm md:text-base">System Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/encryption-status');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/encryption-status'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Encryption Status</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/verification-tools');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/verification-tools'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">✓</span>
//                   <span className="text-sm md:text-base">Verification Tools</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/compliance-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/compliance-reports'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Compliance Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ FINANCIAL MANAGEMENT Section */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Financial Management</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/payment-gateways');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/payment-gateways'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">💳</span>
//                   <span className="text-sm md:text-base">Payment Gateways</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/transaction-monitoring');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/transaction-monitoring'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">💰</span>
//                   <span className="text-sm md:text-base">Transaction Monitoring</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/revenue-analytics');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/revenue-analytics'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📈</span>
//                   <span className="text-sm md:text-base">Revenue Analytics</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/prize-distribution');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/prize-distribution'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🎁</span>
//                   <span className="text-sm md:text-base">Prize Distribution</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/regional-pricing');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/regional-pricing'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">🌍</span>
//                   <span className="text-sm md:text-base">Regional Pricing</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/refund-management');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/refund-management'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">↩️</span>
//                   <span className="text-sm md:text-base">Refund Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/dashboard/admin/financial-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                     location.pathname === '/dashboard/admin/financial-reports'
//                       ? 'bg-purple-600 text-white font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Financial Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* ✅ MAIN CONTENT - KEY CHANGE HERE */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
            
//             {/* ✅ CRITICAL: Render admin routes via Outlet or regular tabs */}
//             {isAdminRoute ? (
//               <Outlet /> // Renders nested admin routes (NO LAYOUT WRAPPER NEEDED!)
//             ) : (
//               <ActiveComponent /> // Renders regular dashboard tabs
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
//last workbale code only to use perfect routing to prevent page loads, above code
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';

// // Import NEW voting-related tab components
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';
// import CreatorWallet from '../components/Dashboard/Tabs/wallet/CreatorWallet';

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';
// import MyElections from '../components/Dashboard/Tabs/election/MyElections';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   useEffect(() => {
//     const tabFromUrl = searchParams.get('tab');
//     if (tabFromUrl) {
//       setActiveTab(tabFromUrl);
//     }
//   }, [searchParams]);

//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') ||
//       role.includes('organizationelectioncreator') ||
//       role.includes('contentcreator')
//     );

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     // Public Bulletin
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // My Elections Tab (for creators)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'my-elections',
//         label: 'My Elections',
//         icon: '📁',
//         component: MyElections,
//       });
//     }

//     // Voter Wallet - Always show
//     tabsList.push({
//       id: 'wallet',
//       label: 'My Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // Creator Wallet - Show if user has creator role
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'creator-wallet',
//         label: 'Creator Wallet',
//         icon: '💵',
//         component: CreatorWallet,
//       });
//     }

//     // Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // Create Election Tab
//     tabsList.push({
//       id: 'create-election',
//       label: 'Create Election',
//       icon: '➕',
//       component: CreateElection,
//     });

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]);

//   useEffect(() => {
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check user roles
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');
//   const isAdmin = normalizedRoles.includes('admin');
//   const isAuditor = normalizedRoles.includes('auditor');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* ✅ ADMIN Section - Only for Managers */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ SECURITY & AUDIT Section - For Manager/Admin/Auditor */}
//           {(isManager || isAdmin || isAuditor) && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Security & Audit</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/vote-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔍</span>
//                   <span className="text-sm md:text-base">Vote Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/security-logs');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Security Logs</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/system-audit');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📝</span>
//                   <span className="text-sm md:text-base">System Audit</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/encryption-status');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Encryption Status</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/verification-tools');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">✓</span>
//                   <span className="text-sm md:text-base">Verification Tools</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/compliance-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Compliance Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* ✅ FINANCIAL MANAGEMENT Section - Only for Managers */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Financial Management</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/payment-gateways');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">💳</span>
//                   <span className="text-sm md:text-base">Payment Gateways</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/transaction-monitoring');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">💰</span>
//                   <span className="text-sm md:text-base">Transaction Monitoring</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/revenue-analytics');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📈</span>
//                   <span className="text-sm md:text-base">Revenue Analytics</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/prize-distribution');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🎁</span>
//                   <span className="text-sm md:text-base">Prize Distribution</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/regional-pricing');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🌍</span>
//                   <span className="text-sm md:text-base">Regional Pricing</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/refund-management');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">↩️</span>
//                   <span className="text-sm md:text-base">Refund Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/financial-reports');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📊</span>
//                   <span className="text-sm md:text-base">Financial Reports</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
//last workable code, just to add more tabs above code
// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';
// //import MyElections from '../components/Dashboard/Tabs/MyElections'; // ✅ NEW

// // Import NEW voting-related tab components
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';
// import CreatorWallet from '../components/Dashboard/Tabs/wallet/CreatorWallet'; // ✅ NEW

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';
// import MyElections from '../components/Dashboard/Tabs/election/MyElections';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   // Get tab from URL query parameter or default to 'dashboard'
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   // ✅ Preserves user info + uses live roles
//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       // ✅ Use live roles if available, fallback to profile/auth
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   useEffect(() => {
//     const tabFromUrl = searchParams.get('tab');
//     if (tabFromUrl) {
//       setActiveTab(tabFromUrl);
//     }
//   }, [searchParams]);

//   // Memoize tabs - only recalculate when roles change OR creator status changes
//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     // ✅ Check if user can create elections (any creator role) - FREE OR PAID
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') || // Matches both "individualelectioncreator(free)" and "individualelectioncreator(subscribed)"
//       role.includes('organizationelectioncreator') || // Organization Election Creator
//       role.includes('contentcreator') // Content Creator
//     );

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // ✅ NEW: My Elections Tab (for creators to see their own elections)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'my-elections',
//         label: 'My Elections',
//         icon: '📁',
//         component: MyElections,
//       });
//     }

//     // ✅ VOTER WALLET - Always show
//     tabsList.push({
//       id: 'wallet',
//       label: 'My Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // ✅ CREATOR WALLET - Show if user has ANY creator role (FREE OR PAID)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'creator-wallet',
//         label: 'Creator Wallet',
//         icon: '💵',
//         component: CreatorWallet,
//       });
//     }

//     // Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // ✅ Create Election Tab - EVERYONE can create elections (as it was originally)
//     tabsList.push({
//       id: 'create-election',
//       label: 'Create Election',
//       icon: '➕',
//       component: CreateElection,
//     });

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]); // ✅ Only re-calculate when roles change

//   // ✅ FIXED: Redirect if not authenticated - Check localStorage too
//   useEffect(() => {
//     // Check localStorage for tokens
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   // Load profile data
//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   // Show loading only initially
//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check if user is manager
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Admin Section - Only show if manager */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';
// //import MyElections from '../components/Dashboard/Tabs/MyElections'; // ✅ NEW

// // Import NEW voting-related tab components
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';
// import CreatorWallet from '../components/Dashboard/Tabs/wallet/CreatorWallet'; // ✅ NEW

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';
// import MyElections from '../components/Dashboard/Tabs/election/MyElections';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   // Get tab from URL query parameter or default to 'dashboard'
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   // ✅ Preserves user info + uses live roles
//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       // ✅ Use live roles if available, fallback to profile/auth
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   useEffect(() => {
//     const tabFromUrl = searchParams.get('tab');
//     if (tabFromUrl) {
//       setActiveTab(tabFromUrl);
//     }
//   }, [searchParams]);

//   // Memoize tabs - only recalculate when roles change OR creator status changes
//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     // ✅ Check if user can create elections (any creator role)
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') || // Individual Election Creator (Free/Subscribed)
//       role.includes('organizationelectioncreator') || // Organization Election Creator
//       role === 'contentcreator' // Content Creator
//     );

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // ✅ NEW: My Elections Tab (for creators to see their own elections)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'my-elections',
//         label: 'My Elections',
//         icon: '📁',
//         component: MyElections,
//       });
//     }

//     // ✅ VOTER WALLET - Always show
//     tabsList.push({
//       id: 'wallet',
//       label: 'My Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // ✅ CREATOR WALLET - Show if user has ANY creator role (regardless of elections created)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'creator-wallet',
//         label: 'Creator Earnings',
//         icon: '💵',
//         component: CreatorWallet,
//       });
//     }

//     // Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // ✅ Create Election Tab - EVERYONE can create elections (as it was originally)
//     tabsList.push({
//       id: 'create-election',
//       label: 'Create Election',
//       icon: '➕',
//       component: CreateElection,
//     });

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]); // ✅ Only re-calculate when roles change

//   // ✅ FIXED: Redirect if not authenticated - Check localStorage too
//   useEffect(() => {
//     // Check localStorage for tokens
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   // Load profile data
//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   // Show loading only initially
//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check if user is manager
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Admin Section - Only show if manager */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';

// // Import NEW voting-related tab components
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';
// import CreatorWallet from '../components/Dashboard/Tabs/wallet/CreatorWallet'; // ✅ NEW

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   // Get tab from URL query parameter or default to 'dashboard'
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   // ✅ Preserves user info + uses live roles
//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       // ✅ Use live roles if available, fallback to profile/auth
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   useEffect(() => {
//     const tabFromUrl = searchParams.get('tab');
//     if (tabFromUrl) {
//       setActiveTab(tabFromUrl);
//     }
//   }, [searchParams]);

//   // Memoize tabs - only recalculate when roles change OR creator status changes
//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     // ✅ Check if user can create elections (any creator role)
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') || // Individual Election Creator (Free/Subscribed)
//       role.includes('organizationelectioncreator') || // Organization Election Creator
//       role === 'contentcreator' // Content Creator
//     );

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // ✅ VOTER WALLET - Always show
//     tabsList.push({
//       id: 'wallet',
//       label: 'My Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // ✅ CREATOR WALLET - Show if user has ANY creator role (regardless of elections created)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'creator-wallet',
//         label: 'Creator Earnings',
//         icon: '💵',
//         component: CreatorWallet,
//       });
//     }

//     // Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // ✅ Create Election Tab - EVERYONE can create elections (as it was originally)
//     tabsList.push({
//       id: 'create-election',
//       label: 'Create Election',
//       icon: '➕',
//       component: CreateElection,
//     });

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]); // ✅ Only re-calculate when roles change

//   // ✅ FIXED: Redirect if not authenticated - Check localStorage too
//   useEffect(() => {
//     // Check localStorage for tokens
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   // Load profile data
//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   // Show loading only initially
//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check if user is manager
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Admin Section - Only show if manager */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';

// // Import NEW voting-related tab components
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';
// import CreatorWallet from '../components/Dashboard/Tabs/wallet/CreatorWallet'; // ✅ NEW

// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });
  
//   // Get tab from URL query parameter or default to 'dashboard'
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   // ✅ Preserves user info + uses live roles
//   const currentUser = useMemo(() => {
//     const profile = profileData?.profile || {};
//     const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
    
//     return {
//       user_firstname: profile.user_firstname || auth.firstName || 'User',
//       user_lastname: profile.user_lastname || auth.lastName || '',
//       user_email: profile.user_email || auth.email || '',
//       user_id: profile.user_id || auth.userId,
//       // ✅ Use live roles if available, fallback to profile/auth
//       roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//     };
//   }, [profileData, liveRolesData, auth]);

//   useEffect(() => {
//     const tabFromUrl = searchParams.get('tab');
//     if (tabFromUrl) {
//       setActiveTab(tabFromUrl);
//     }
//   }, [searchParams]);

//   // Memoize tabs - only recalculate when roles change OR creator status changes
//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim().replace(/\s+/g, ''));

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');
    
//     // ✅ Check if user can create elections (any creator role)
//     const canCreateElections = normalizedRoles.some(role => 
//       role.includes('electioncreator') || // Individual Election Creator (Free/Subscribed)
//       role.includes('organizationelectioncreator') || // Organization Election Creator
//       role === 'contentcreator' // Content Creator
//     );

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // ✅ VOTER WALLET - Always show
//     tabsList.push({
//       id: 'wallet',
//       label: 'My Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // ✅ CREATOR WALLET - Show if user has ANY creator role (regardless of elections created)
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'creator-wallet',
//         label: 'Creator Earnings',
//         icon: '💵',
//         component: CreatorWallet,
//       });
//     }

//     // Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // ✅ Create Election Tab - Show if user has ANY creator role
//     if (canCreateElections) {
//       tabsList.push({
//         id: 'create-election',
//         label: 'Create Election',
//         icon: '➕',
//         component: CreateElection,
//       });
//     }

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]); // ✅ Only re-calculate when roles change

//   // ✅ FIXED: Redirect if not authenticated - Check localStorage too
//   useEffect(() => {
//     // Check localStorage for tokens
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   // Load profile data
//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   // Show loading only initially
//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check if user is manager
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Admin Section - Only show if manager */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
//last workable perfect code
// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';

// // Import NEW voting-related tab components
// //import Wallet from '../components/Dashboard/Tabs/Wallet';
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
// import RoleManagement from '../components/Dashboard/Tabs/roles/RoleManagement';
// import PermissionManagement from '../components/Dashboard/Tabs/roles/PermissionManagement';
// import UserRoleAssignment from '../components/Dashboard/Tabs/roles/UserRoleAssignment';
// import RoleAssignmentHistory from '../components/Dashboard/Tabs/roles/RoleAssignmentHistory';
// import { useGetUserRolesQuery } from '../redux/api/role/roleApi';
// import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';



// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//   skip: !auth.userId,
// });
  
//   // Get tab from URL query parameter or default to 'dashboard'
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   /*eslint-disable*/
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

 
// // ✅ NEW: Preserves user info + uses live roles
// const currentUser = useMemo(() => {
//   const profile = profileData?.profile || {};
//   const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
  
//   return {
//     user_firstname: profile.user_firstname || auth.firstName || 'User',
//     user_lastname: profile.user_lastname || auth.lastName || '',
//     user_email: profile.user_email || auth.email || '',
//     user_id: profile.user_id || auth.userId,
//     // ✅ Use live roles if available, fallback to profile/auth
//     roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
//   };
// }, [profileData, liveRolesData, auth]);


//   useEffect(() => {
//   const tabFromUrl = searchParams.get('tab');
//   if (tabFromUrl) {
//     setActiveTab(tabFromUrl);
//   }
// }, [searchParams]);

//   // Memoize tabs - only recalculate when roles change
//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     /*eslint-disable*/
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // NEW: Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // NEW: Wallet Tab
//     tabsList.push({
//       id: 'wallet',
//       label: 'Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // NEW: Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Gamified Election Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // Create Election Tab (Content Creators, Admins, Managers only)
//     // if (isContentCreator || isAdmin || isManager) {
//     //   tabsList.push({
//     //     id: 'create-election',
//     //     label: 'Create Election',
//     //     icon: '➕',
//     //     component: CreateElection,
//     //   });
//     // }
// //any role can create elections
        
//       tabsList.push({
//         id: 'create-election',
//         label: 'Create Election',
//         icon: '➕',
//         component: CreateElection,
//       });
//     //       if (isContentCreator) {
//     //   tabsList.push({
//     //     id: 'create-election',
//     //     label: 'Create Election',
//     //     icon: '➕',
//     //     component: CreateElection,
//     //   });
//     // }
   

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });

//       // ✅ NEW: Role Management Tabs (Admins, Managers only)
//       // tabsList.push({
//       //   id: 'role-management',
//       //   label: 'Role Management',
//       //   icon: '🛡️',
//       //   component: RoleManagement,
//       // });

//       // tabsList.push({
//       //   id: 'permission-management',
//       //   label: 'Permissions',
//       //   icon: '🔐',
//       //   component: PermissionManagement,
//       // });

//       // tabsList.push({
//       //   id: 'user-roles',
//       //   label: 'User Roles',
//       //   icon: '👤',
//       //   component: UserRoleAssignment,
//       // });

//       // tabsList.push({
//       //   id: 'role-history',
//       //   label: 'Role History',
//       //   icon: '📋',
//       //   component: RoleAssignmentHistory,
//       // });
//     }

//     return tabsList;
//   }, [currentUser?.roles]);

//   // ✅ FIXED: Redirect if not authenticated - Check localStorage too
//   useEffect(() => {
//     // Check localStorage for tokens
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   // Load profile data
//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   // Show loading only initially
//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check if user is manager
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Admin Section - Only show if manager */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//                 {/* ✅ NEW: Role Management Admin Links */}
//                 <button
//                   onClick={() => {
//                     navigate('/admin/roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🛡️</span>
//                   <span className="text-sm md:text-base">Role Management</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/permissions');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">🔐</span>
//                   <span className="text-sm md:text-base">Permissions</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/user-roles');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">👤</span>
//                   <span className="text-sm md:text-base">User Roles</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigate('/admin/role-history');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">📋</span>
//                   <span className="text-sm md:text-base">Role History</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }





















//last workable code
// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { logout } from '../redux/slices/authSlice';
// import { useGetProfileMutation } from '../redux/api/user/userApi';
// import { useAuth } from '../redux/hooks';
// import { Loader } from 'lucide-react';

// // Import existing tab components
// import CreateElection from '../components/Dashboard/Tabs/CreateElection';
// import VoteNow from '../components/Dashboard/Tabs/VoteNow';
// import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
// import AllElections from '../components/Dashboard/Tabs/AllElections';
// import UserManagement from '../components/Dashboard/Tabs/UserManagement';
// import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
// import Dashboard from '../components/Dashboard/Tabs/Dashboard';
// import Subscription from '../components/Dashboard/Tabs/Subscription';

// // Import NEW voting-related tab components
// import Wallet from '../components/Dashboard/Tabs/Wallet';
// import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
// import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
// import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';

// export default function DashboardPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const auth = useAuth();
//   const [searchParams] = useSearchParams();
  
//   // Get tab from URL query parameter or default to 'dashboard'
//   const [activeTab, setActiveTab] = useState(
//     searchParams.get('tab') || 'dashboard'
//   );
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   const [profileError, setProfileError] = useState(null);

//   const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

//   // Use profile data if available, otherwise use auth data
//   const currentUser = profileData?.profile || {
//     user_firstname: auth.firstName || 'User',
//     user_lastname: auth.lastName || '',
//     user_email: auth.email || '',
//     roles: auth.roles || ['Voter'],
//   };

//   // Update tab when URL query parameter changes
//   // useEffect(() => {
//   //   const tabFromUrl = searchParams.get('tab');
//   //   if (tabFromUrl && tabFromUrl !== activeTab) {
//   //     console.log('🔄 Changing tab from URL:', tabFromUrl);
//   //     setActiveTab(tabFromUrl);
//   //   }
//   // }, [searchParams, activeTab]);

//   useEffect(() => {
//   const tabFromUrl = searchParams.get('tab');
//   if (tabFromUrl) {
//     setActiveTab(tabFromUrl);
//   }
// }, [searchParams]);

//   // Memoize tabs - only recalculate when roles change
//   const tabs = useMemo(() => {
//     let roles = currentUser?.roles || ['Voter'];

//     if (!Array.isArray(roles)) {
//       roles = Object.values(roles);
//     }

//     const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());

//     const isManager = normalizedRoles.includes('manager');
//     const isAdmin = normalizedRoles.includes('admin');
//     const isContentCreator = normalizedRoles.includes('contentcreator');
//     const isModerator = normalizedRoles.includes('moderator');

//     const tabsList = [];

//     // Dashboard Tab
//     tabsList.push({
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: '📊',
//       component: Dashboard,
//     });
    
//     tabsList.push({
//       id: 'public-bulletin',
//       label: 'Public Bulletin',
//       icon: '🌐',
//       component: PublicBulletin,
//     });

//     // Vote Now Tab
//     tabsList.push({
//       id: 'vote-now',
//       label: 'Vote Now',
//       icon: '🗳️',
//       component: VoteNow,
//     });

//     // NEW: Vote History Tab
//     tabsList.push({
//       id: 'vote-history',
//       label: 'My Votes',
//       icon: '📜',
//       component: VoteHistory,
//     });

//     // All Elections Tab
//     tabsList.push({
//       id: 'all-elections',
//       label: 'All Elections',
//       icon: '📋',
//       component: AllElections,
//     });

//     // NEW: Wallet Tab
//     tabsList.push({
//       id: 'wallet',
//       label: 'Wallet',
//       icon: '💰',
//       component: Wallet,
//     });

//     // NEW: Lottery Tickets Tab
//     tabsList.push({
//       id: 'lottery',
//       label: 'Lottery Tickets',
//       icon: '🎰',
//       component: LotteryTickets,
//     });

//     // Subscriptions Tab
//     tabsList.push({
//       id: 'subscription',
//       label: 'Subscriptions',
//       icon: '💳',
//       component: Subscription,
//     });

//     // Create Election Tab (Content Creators, Admins, Managers only)
//     if (isContentCreator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'create-election',
//         label: 'Create Election',
//         icon: '➕',
//         component: CreateElection,
//       });
//     }

//     // Verify Votes Tab (Moderators, Admins, Managers only)
//     if (isModerator || isAdmin || isManager) {
//       tabsList.push({
//         id: 'verify-votes',
//         label: 'Verify Votes',
//         icon: '✓',
//         component: VerifyVotes,
//       });
//     }

//     // User Management Tab (Admins, Managers only)
//     if (isAdmin || isManager) {
//       tabsList.push({
//         id: 'user-management',
//         label: 'User Management',
//         icon: '👥',
//         component: UserManagement,
//       });

//       // Audit Trail Tab (Admins, Managers only)
//       tabsList.push({
//         id: 'audit-trail',
//         label: 'Audit Trail',
//         icon: '📝',
//         component: AuditTrail,
//       });
//     }

//     return tabsList;
//   }, [currentUser?.roles]);

//   // ✅ FIXED: Redirect if not authenticated - Check localStorage too
//   useEffect(() => {
//     // Check localStorage for tokens
//     const accessToken = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
    
//     // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
//     const isAuthenticated = auth.isAuthenticated || (accessToken && userId);
    
//     if (!isAuthenticated) {
//       console.log('❌ Not authenticated, redirecting to auth');
//       navigate('/auth', { replace: true });
//       return;
//     }
//     console.log('✅ User authenticated:', { 
//       reduxAuth: auth.isAuthenticated,
//       hasTokenInStorage: !!accessToken,
//       userId: userId || auth.userId,
//       email: auth.email 
//     });
//   }, [auth.isAuthenticated, navigate, auth.userId, auth.email]);

//   // Load profile data
//   useEffect(() => {
//     if (auth.userId && !profileLoaded) {
//       console.log('📤 Loading user profile for userId:', auth.userId);
//       getProfile(auth.userId)
//         .then((result) => {
//           console.log('✅ Profile loaded:', result);
//           setProfileLoaded(true);
//           setProfileError(null);
//         })
//         .catch((error) => {
//           console.error('❌ Profile load error:', error);
//           setProfileError(error?.data?.message || 'Failed to load profile');
//           setProfileLoaded(true);
//         });
//     }
//   }, [auth.userId, profileLoaded, getProfile]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleGoToProfile = () => {
//     navigate('/profile');
//   };

//   console.log('📊 Dashboard render with user:', {
//     firstName: currentUser?.user_firstname,
//     roles: currentUser?.roles,
//     profileLoading,
//     profileLoaded,
//   });

//   // Show loading only initially
//   if (!profileLoaded && profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const ActiveComponent = activeTabData?.component || Dashboard;

//   // Check if user is manager
//   let roles = currentUser?.roles || ['Voter'];
//   if (!Array.isArray(roles)) {
//     roles = Object.values(roles);
//   }
//   const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
//   const isManager = normalizedRoles.includes('manager');

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//               </div>
//               <span className="text-sm font-medium hidden md:inline">
//                 {currentUser?.user_firstname || 'User'}
//               </span>
//             </div>
//             <button
//               onClick={handleGoToProfile}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Profile
//             </button>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* User Card */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="text-center">
//               <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                 {currentUser?.user_firstname?.[0] || 'U'}
//                 {currentUser?.user_lastname?.[0] || ''}
//               </div>
//               <h3 className="font-bold text-sm">
//                 {currentUser?.user_firstname} {currentUser?.user_lastname}
//               </h3>
//               <p className="text-xs text-gray-600 truncate">{currentUser?.user_email}</p>
//               <div className="mt-2 flex flex-wrap gap-1 justify-center">
//                 {currentUser?.roles && Object.values(currentUser.roles).map((role) => (
//                   <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                     {role}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="p-4 space-y-2">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
//                   activeTab === tab.id
//                     ? 'bg-blue-600 text-white font-semibold'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span className="text-sm md:text-base">{tab.label}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Admin Section - Only show if manager */}
//           {isManager && (
//             <>
//               <div className="mt-6 pt-4 px-4 border-t border-gray-200">
//                 <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
//               </div>
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => {
//                     navigate('/admin/subscription');
//                     setSidebarOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
//                 >
//                   <span className="text-lg">⚙️</span>
//                   <span className="text-sm md:text-base">Subscription Admin</span>
//                 </button>
//               </nav>
//             </>
//           )}

//           {/* Stats Section */}
//           <div className="p-4 border-t border-gray-200 space-y-3">
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Total Votes</p>
//               <p className="text-2xl font-bold text-blue-600">24</p>
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-xs text-gray-600">Elections Created</p>
//               <p className="text-2xl font-bold text-green-600">3</p>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-8">
//             {profileError && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-800">
//                   Warning: {profileError}. Continuing with basic user data.
//                 </p>
//               </div>
//             )}
//             <ActiveComponent />
//           </div>
//         </main>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
