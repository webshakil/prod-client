// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { useGetProfileMutation } from '../redux/api/user/userApi';
import { useAuth } from '../redux/hooks';
import { Loader } from 'lucide-react';

// Import existing tab components
import CreateElection from '../components/Dashboard/Tabs/CreateElection';
import VoteNow from '../components/Dashboard/Tabs/VoteNow';
import VerifyVotes from '../components/Dashboard/Tabs/VerifyVotes';
import AllElections from '../components/Dashboard/Tabs/AllElections';
import UserManagement from '../components/Dashboard/Tabs/UserManagement';
import AuditTrail from '../components/Dashboard/Tabs/AuditTrail';
import Dashboard from '../components/Dashboard/Tabs/Dashboard';
import Subscription from '../components/Dashboard/Tabs/Subscription';

// Import NEW voting-related tab components
//import Wallet from '../components/Dashboard/Tabs/Wallet';
import LotteryTickets from '../components/Dashboard/Tabs/LotteryTickets';
import VoteHistory from '../components/Dashboard/Tabs/VoteHistory';
import PublicBulletin from '../components/Dashboard/Tabs/PublicBulletin';
import RoleManagement from '../components/Dashboard/Tabs/roles/RoleManagement';
import PermissionManagement from '../components/Dashboard/Tabs/roles/PermissionManagement';
import UserRoleAssignment from '../components/Dashboard/Tabs/roles/UserRoleAssignment';
import RoleAssignmentHistory from '../components/Dashboard/Tabs/roles/RoleAssignmentHistory';
import { useGetUserRolesQuery } from '../redux/api/role/roleApi';
import Wallet from '../components/Dashboard/Tabs/wallet/Wallet';



export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
  skip: !auth.userId,
});
  
  // Get tab from URL query parameter or default to 'dashboard'
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  /*eslint-disable*/
  const [profileError, setProfileError] = useState(null);

  const [getProfile, { isLoading: profileLoading, data: profileData }] = useGetProfileMutation();

 
// ✅ NEW: Preserves user info + uses live roles
const currentUser = useMemo(() => {
  const profile = profileData?.profile || {};
  const liveRoles = liveRolesData?.data?.map(r => r.role_name) || [];
  
  return {
    user_firstname: profile.user_firstname || auth.firstName || 'User',
    user_lastname: profile.user_lastname || auth.lastName || '',
    user_email: profile.user_email || auth.email || '',
    user_id: profile.user_id || auth.userId,
    // ✅ Use live roles if available, fallback to profile/auth
    roles: liveRoles.length > 0 ? liveRoles : (profile.roles || auth.roles || ['Voter']),
  };
}, [profileData, liveRolesData, auth]);


  useEffect(() => {
  const tabFromUrl = searchParams.get('tab');
  if (tabFromUrl) {
    setActiveTab(tabFromUrl);
  }
}, [searchParams]);

  // Memoize tabs - only recalculate when roles change
  const tabs = useMemo(() => {
    let roles = currentUser?.roles || ['Voter'];

    if (!Array.isArray(roles)) {
      roles = Object.values(roles);
    }

    const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());

    const isManager = normalizedRoles.includes('manager');
    const isAdmin = normalizedRoles.includes('admin');
    /*eslint-disable*/
    const isContentCreator = normalizedRoles.includes('contentcreator');
    const isModerator = normalizedRoles.includes('moderator');

    const tabsList = [];

    // Dashboard Tab
    tabsList.push({
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      component: Dashboard,
    });
    
    tabsList.push({
      id: 'public-bulletin',
      label: 'Public Bulletin',
      icon: '🌐',
      component: PublicBulletin,
    });

    // Vote Now Tab
    tabsList.push({
      id: 'vote-now',
      label: 'Vote Now',
      icon: '🗳️',
      component: VoteNow,
    });

    // NEW: Vote History Tab
    tabsList.push({
      id: 'vote-history',
      label: 'My Votes',
      icon: '📜',
      component: VoteHistory,
    });

    // All Elections Tab
    tabsList.push({
      id: 'all-elections',
      label: 'All Elections',
      icon: '📋',
      component: AllElections,
    });

    // NEW: Wallet Tab
    tabsList.push({
      id: 'wallet',
      label: 'Wallet',
      icon: '💰',
      component: Wallet,
    });

    // NEW: Lottery Tickets Tab
    tabsList.push({
      id: 'lottery',
      label: 'Gamified Election Tickets',
      icon: '🎰',
      component: LotteryTickets,
    });

    // Subscriptions Tab
    tabsList.push({
      id: 'subscription',
      label: 'Subscriptions',
      icon: '💳',
      component: Subscription,
    });

    // Create Election Tab (Content Creators, Admins, Managers only)
    // if (isContentCreator || isAdmin || isManager) {
    //   tabsList.push({
    //     id: 'create-election',
    //     label: 'Create Election',
    //     icon: '➕',
    //     component: CreateElection,
    //   });
    // }
//any role can create elections
        
      tabsList.push({
        id: 'create-election',
        label: 'Create Election',
        icon: '➕',
        component: CreateElection,
      });
    //       if (isContentCreator) {
    //   tabsList.push({
    //     id: 'create-election',
    //     label: 'Create Election',
    //     icon: '➕',
    //     component: CreateElection,
    //   });
    // }
   

    // Verify Votes Tab (Moderators, Admins, Managers only)
    if (isModerator || isAdmin || isManager) {
      tabsList.push({
        id: 'verify-votes',
        label: 'Verify Votes',
        icon: '✓',
        component: VerifyVotes,
      });
    }

    // User Management Tab (Admins, Managers only)
    if (isAdmin || isManager) {
      tabsList.push({
        id: 'user-management',
        label: 'User Management',
        icon: '👥',
        component: UserManagement,
      });

      // Audit Trail Tab (Admins, Managers only)
      tabsList.push({
        id: 'audit-trail',
        label: 'Audit Trail',
        icon: '📝',
        component: AuditTrail,
      });

      // ✅ NEW: Role Management Tabs (Admins, Managers only)
      // tabsList.push({
      //   id: 'role-management',
      //   label: 'Role Management',
      //   icon: '🛡️',
      //   component: RoleManagement,
      // });

      // tabsList.push({
      //   id: 'permission-management',
      //   label: 'Permissions',
      //   icon: '🔐',
      //   component: PermissionManagement,
      // });

      // tabsList.push({
      //   id: 'user-roles',
      //   label: 'User Roles',
      //   icon: '👤',
      //   component: UserRoleAssignment,
      // });

      // tabsList.push({
      //   id: 'role-history',
      //   label: 'Role History',
      //   icon: '📋',
      //   component: RoleAssignmentHistory,
      // });
    }

    return tabsList;
  }, [currentUser?.roles]);

  // ✅ FIXED: Redirect if not authenticated - Check localStorage too
  useEffect(() => {
    // Check localStorage for tokens
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    // User is authenticated if EITHER Redux says so OR tokens exist in localStorage
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

  // Load profile data
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth', { replace: true });
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  console.log('📊 Dashboard render with user:', {
    firstName: currentUser?.user_firstname,
    roles: currentUser?.roles,
    profileLoading,
    profileLoaded,
  });

  // Show loading only initially
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

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || Dashboard;

  // Check if user is manager
  let roles = currentUser?.roles || ['Voter'];
  if (!Array.isArray(roles)) {
    roles = Object.values(roles);
  }
  const normalizedRoles = roles.map((r) => String(r).toLowerCase().trim());
  const isManager = normalizedRoles.includes('manager');

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
          <div className="flex gap-4 items-center">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser?.user_firstname?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium hidden md:inline">
                {currentUser?.user_firstname || 'User'}
              </span>
            </div>
            <button
              onClick={handleGoToProfile}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
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
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Admin Section - Only show if manager */}
          {isManager && (
            <>
              <div className="mt-6 pt-4 px-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 font-semibold uppercase">Admin</p>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => {
                    navigate('/admin/subscription');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-sm md:text-base">Subscription Admin</span>
                </button>
                {/* ✅ NEW: Role Management Admin Links */}
                <button
                  onClick={() => {
                    navigate('/admin/roles');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-lg">🛡️</span>
                  <span className="text-sm md:text-base">Role Management</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/permissions');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-lg">🔐</span>
                  <span className="text-sm md:text-base">Permissions</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/user-roles');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-lg">👤</span>
                  <span className="text-sm md:text-base">User Roles</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/role-history');
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                >
                  <span className="text-lg">📋</span>
                  <span className="text-sm md:text-base">Role History</span>
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
            <ActiveComponent />
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
