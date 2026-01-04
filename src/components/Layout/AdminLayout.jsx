// src/components/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import { useGetUserRolesQuery } from '../../redux/api/role/roleApi';
import { ChevronLeft, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
    skip: !auth.userId,
  });

  const userRoles = liveRolesData?.data?.map(r => r.role_name) || auth.roles || [];
  const normalizedRoles = userRoles.map(r => String(r).toLowerCase().trim());
  
  const isManager = normalizedRoles.includes('manager');
  const isAdmin = normalizedRoles.includes('admin');
  const isAuditor = normalizedRoles.includes('auditor');

  const adminMenuItems = [
    {
      section: 'ADMIN',
      visible: isManager,
      items: [
        { path: '/admin/subscription', label: 'Subscription Admin', icon: '⚙️' },
        { path: '/admin/roles', label: 'Role Management', icon: '🛡️' },
        { path: '/admin/permissions', label: 'Permissions', icon: '🔐' },
        { path: '/admin/user-roles', label: 'User Roles', icon: '👤' },
        { path: '/admin/role-history', label: 'Role History', icon: '📋' },
      ],
    },
    {
      section: 'SECURITY & AUDIT',
      visible: isManager || isAdmin || isAuditor,
      items: [
        { path: '/admin/vote-audit', label: 'Vote Audit', icon: '🔍' },
        { path: '/admin/security-logs', label: 'Security Logs', icon: '🔐' },
        { path: '/admin/system-audit', label: 'System Audit', icon: '📝' },
        { path: '/admin/encryption-status', label: 'Encryption Status', icon: '🛡️' },
        { path: '/admin/verification-tools', label: 'Verification Tools', icon: '✓' },
        { path: '/admin/compliance-reports', label: 'Compliance Reports', icon: '📊' },
        { path: '/admin/election-stats', label: 'Election Status', icon: '📊' }
      ],
    },
    {
      section: 'FINANCIAL MANAGEMENT',
      visible: isManager,
      items: [
        { path: '/admin/payment-gateways', label: 'Payment Gateways', icon: '💳' },
        { path: '/admin/transaction-monitoring', label: 'Transaction Monitoring', icon: '💰' },
        { path: '/admin/revenue-analytics', label: 'Revenue Analytics', icon: '📈' },
        { path: '/admin/prize-distribution', label: 'Prize Distribution', icon: '🎁' },
        { path: '/admin/regional-pricing', label: 'Regional Pricing', icon: '🌍' },
        { path: '/admin/refund-management', label: 'Refund Management', icon: '↩️' },
        { path: '/admin/financial-reports', label: 'Financial Reports', icon: '📊' },
      ],
    },
  ];

  const getCurrentPageTitle = () => {
    const allItems = adminMenuItems.flatMap(section => section.items);
    const currentItem = allItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Admin';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* ✅ UPDATED: Back to Dashboard with query param */}
            <button
              onClick={() => navigate('/dashboard?tab=dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">Admin</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-semibold">{getCurrentPageTitle()}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {auth.firstName?.[0] || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{auth.firstName || 'Admin'}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
        >
          {/* Admin Title */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔧</span>
              <span>Admin Panel</span>
            </h2>
            <p className="text-xs text-purple-100 mt-1">System Management</p>
          </div>

          {/* Navigation Menu */}
          <nav className="py-4">
            {adminMenuItems.map((section, sectionIndex) => {
              if (!section.visible) return null;

              return (
                <div key={sectionIndex} className="mb-6">
                  {/* Section Header */}
                  <div className="px-4 mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {section.section}
                    </p>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-1 px-2">
                    {section.items.map((item, itemIndex) => {
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Admin Mode Active</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
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
// // src/components/layouts/AdminLayout.jsx
// import React, { useState } from 'react';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { useAuth } from '../../redux/hooks';
// import { useGetUserRolesQuery } from '../../redux/api/role/roleApi';
// import { ChevronLeft, Menu, X } from 'lucide-react';

// export default function AdminLayout({ children }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const auth = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const { data: liveRolesData } = useGetUserRolesQuery(auth.userId, {
//     skip: !auth.userId,
//   });

//   // Get user roles
//   const userRoles = liveRolesData?.data?.map(r => r.role_name) || auth.roles || [];
//   const normalizedRoles = userRoles.map(r => String(r).toLowerCase().trim());
  
//   const isManager = normalizedRoles.includes('manager');
//   const isAdmin = normalizedRoles.includes('admin');
//   const isAuditor = normalizedRoles.includes('auditor');

//   // Admin menu items
//   const adminMenuItems = [
//     {
//       section: 'ADMIN',
//       visible: isManager,
//       items: [
//         { path: '/admin/subscription', label: 'Subscription Admin', icon: '⚙️' },
//         { path: '/admin/roles', label: 'Role Management', icon: '🛡️' },
//         { path: '/admin/permissions', label: 'Permissions', icon: '🔐' },
//         { path: '/admin/user-roles', label: 'User Roles', icon: '👤' },
//         { path: '/admin/role-history', label: 'Role History', icon: '📋' },
//       ],
//     },
//     {
//       section: 'SECURITY & AUDIT',
//       visible: isManager || isAdmin || isAuditor,
//       items: [
//         { path: '/admin/vote-audit', label: 'Vote Audit', icon: '🔍' },
//         { path: '/admin/security-logs', label: 'Security Logs', icon: '🔐' },
//         { path: '/admin/system-audit', label: 'System Audit', icon: '📝' },
//         { path: '/admin/encryption-status', label: 'Encryption Status', icon: '🛡️' },
//         { path: '/admin/verification-tools', label: 'Verification Tools', icon: '✓' },
//         { path: '/admin/compliance-reports', label: 'Compliance Reports', icon: '📊' },
//       ],
//     },
//     {
//       section: 'FINANCIAL MANAGEMENT',
//       visible: isManager,
//       items: [
//         { path: '/admin/payment-gateways', label: 'Payment Gateways', icon: '💳' },
//         { path: '/admin/transaction-monitoring', label: 'Transaction Monitoring', icon: '💰' },
//         { path: '/admin/revenue-analytics', label: 'Revenue Analytics', icon: '📈' },
//         { path: '/admin/prize-distribution', label: 'Prize Distribution', icon: '🎁' },
//         { path: '/admin/regional-pricing', label: 'Regional Pricing', icon: '🌍' },
//         { path: '/admin/refund-management', label: 'Refund Management', icon: '↩️' },
//         { path: '/admin/financial-reports', label: 'Financial Reports', icon: '📊' },
//       ],
//     },
//   ];

//   // Get current page title from path
//   const getCurrentPageTitle = () => {
//     const allItems = adminMenuItems.flatMap(section => section.items);
//     const currentItem = allItems.find(item => item.path === location.pathname);
//     return currentItem?.label || 'Admin';
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Top Navbar */}
//       <nav className="bg-white shadow-md sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             {/* Mobile menu toggle */}
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>

//             {/* Back to Dashboard */}
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
//             >
//               <ChevronLeft size={20} />
//               <span className="hidden sm:inline">Back to Dashboard</span>
//             </button>

//             {/* Breadcrumb */}
//             <div className="hidden md:flex items-center gap-2 text-sm">
//               <span className="text-gray-500">Admin</span>
//               <span className="text-gray-400">/</span>
//               <span className="text-gray-900 font-semibold">{getCurrentPageTitle()}</span>
//             </div>
//           </div>

//           {/* User Info */}
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:flex items-center gap-2">
//               <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                 {auth.firstName?.[0] || 'A'}
//               </div>
//               <div className="hidden md:block">
//                 <p className="text-sm font-semibold text-gray-900">{auth.firstName || 'Admin'}</p>
//                 <p className="text-xs text-gray-600">Administrator</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="flex h-[calc(100vh-64px)]">
//         {/* Sidebar */}
//         <aside
//           className={`${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0 transition-transform duration-300 w-64 bg-white border-r border-gray-200 overflow-y-auto fixed md:relative z-40 h-full`}
//         >
//           {/* Admin Title */}
//           <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
//             <h2 className="text-lg font-bold text-white flex items-center gap-2">
//               <span>🔧</span>
//               <span>Admin Panel</span>
//             </h2>
//             <p className="text-xs text-purple-100 mt-1">System Management</p>
//           </div>

//           {/* Navigation Menu */}
//           <nav className="py-4">
//             {adminMenuItems.map((section, sectionIndex) => {
//               if (!section.visible) return null;

//               return (
//                 <div key={sectionIndex} className="mb-6">
//                   {/* Section Header */}
//                   <div className="px-4 mb-2">
//                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                       {section.section}
//                     </p>
//                   </div>

//                   {/* Section Items */}
//                   <div className="space-y-1 px-2">
//                     {section.items.map((item, itemIndex) => {
//                       const isActive = location.pathname === item.path;
                      
//                       return (
//                         <Link
//                           key={itemIndex}
//                           to={item.path}
//                           onClick={() => setSidebarOpen(false)}
//                           className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
//                             isActive
//                               ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
//                               : 'text-gray-700 hover:bg-gray-100'
//                           }`}
//                         >
//                           <span className="text-lg">{item.icon}</span>
//                           <span className="text-sm font-medium">{item.label}</span>
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             })}
//           </nav>

//           {/* Footer Info */}
//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
//             <div className="flex items-center gap-2 text-xs text-gray-600">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span>Admin Mode Active</span>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50">
//           <div className="p-6 md:p-8">
//             {children}
//           </div>
//         </main>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }