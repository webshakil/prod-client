import React from 'react';
import AuthPage from '../../pages/AuthPage';
import DashboardPage from '../../pages/DashboardPage';
import ProfilePage from '../Profile/ProfilePage';
import AdminSubscriptionManager from '../../pages/admin/AdminSubscriptionManager';

// ✅ NEW: Sngine Callback Handler
import SngineCallbackHandler from '../Auth/SngineCallbackHandler';

// ✅ Role Management Pages
import RoleManagementPage from '../../pages/admin/RoleManagementPage';
import PermissionManagementPage from '../../pages/admin/PermissionManagementPage';
import UserRoleAssignmentPage from '../../pages/admin/UserRoleAssignmentPage';
import RoleAssignmentHistoryPage from '../../pages/admin/RoleAssignmentHistoryPage';

// Public Routes - No authentication required
export const PUBLIC_ROUTES = [
  {
    path: '/auth',
    element: <AuthPage />,
    label: 'Authentication',
    requiresAuth: false,
  },
  // ✅ NEW: Sngine callback route
  {
    path: '/auth/sngine/callback',
    element: <SngineCallbackHandler />,
    label: 'Sngine Callback',
    requiresAuth: false,
  },
];

// Protected Routes - Authentication required
export const PROTECTED_ROUTES = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
    label: 'Dashboard',
    requiresAuth: true,
    roles: ['user', 'manager', 'admin', 'moderator', 'auditor', 'editor', 'advertiser', 'analyst'],
    inNav: true,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    label: 'Profile',
    requiresAuth: true,
    roles: ['user', 'manager', 'admin', 'moderator', 'auditor', 'editor', 'advertiser', 'analyst'],
    inNav: true,
  },
];

// Subscription Routes (integrated into Dashboard tab)
export const SUBSCRIPTION_ROUTES = [
  // Note: Subscription is now a tab in the Dashboard, not a separate route
];

// Admin Routes - Manager role required
export const ADMIN_ROUTES = [
  {
    path: '/admin/subscription',
    element: <AdminSubscriptionManager />,
    label: 'Subscription Admin',
    requiresAuth: true,
    roles: ['manager', 'admin'],
    requiredRole: 'manager',
    inNav: true,
  },
  // ✅ Role Management Routes
  {
    path: '/admin/roles',
    element: <RoleManagementPage />,
    label: 'Role Management',
    requiresAuth: true,
    roles: ['manager', 'admin'],
    requiredRole: 'manager',
    inNav: true,
  },
  {
    path: '/admin/permissions',
    element: <PermissionManagementPage />,
    label: 'Permission Management',
    requiresAuth: true,
    roles: ['manager', 'admin'],
    requiredRole: 'manager',
    inNav: true,
  },
  {
    path: '/admin/user-roles',
    element: <UserRoleAssignmentPage />,
    label: 'User Role Assignment',
    requiresAuth: true,
    roles: ['manager', 'admin'],
    requiredRole: 'manager',
    inNav: true,
  },
  {
    path: '/admin/role-history',
    element: <RoleAssignmentHistoryPage />,
    label: 'Role History',
    requiresAuth: true,
    roles: ['manager', 'admin', 'auditor'],
    requiredRole: 'manager',
    requiredRoles: ['manager', 'admin', 'auditor'],
    inNav: true,
  },
];

// Combine all routes
export const ALL_ROUTES = [
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...SUBSCRIPTION_ROUTES,
  ...ADMIN_ROUTES,
];
//last workable code only to integrate api above code
// import React from 'react';
// import AuthPage from '../../pages/AuthPage';
// import DashboardPage from '../../pages/DashboardPage';
// import ProfilePage from '../Profile/ProfilePage';
// import AdminSubscriptionManager from '../../pages/admin/AdminSubscriptionManager';

// // ✅ NEW IMPORTS - Role Management Pages
// import RoleManagementPage from '../../pages/admin/RoleManagementPage';
// import PermissionManagementPage from '../../pages/admin/PermissionManagementPage';
// import UserRoleAssignmentPage from '../../pages/admin/UserRoleAssignmentPage';
// import RoleAssignmentHistoryPage from '../../pages/admin/RoleAssignmentHistoryPage';

// // Public Routes - No authentication required
// export const PUBLIC_ROUTES = [
//   {
//     path: '/auth',
//     element: <AuthPage />,
//     label: 'Authentication',
//     requiresAuth: false,
//   },
// ];

// // Protected Routes - Authentication required
// export const PROTECTED_ROUTES = [
//   {
//     path: '/dashboard',
//     element: <DashboardPage />,
//     label: 'Dashboard',
//     requiresAuth: true,
//     roles: ['user', 'manager', 'admin', 'moderator', 'auditor', 'editor', 'advertiser', 'analyst'],
//     inNav: true,
//   },
//   {
//     path: '/profile',
//     element: <ProfilePage />,
//     label: 'Profile',
//     requiresAuth: true,
//     roles: ['user', 'manager', 'admin', 'moderator', 'auditor', 'editor', 'advertiser', 'analyst'],
//     inNav: true,
//   },
// ];

// // Subscription Routes (integrated into Dashboard tab)
// export const SUBSCRIPTION_ROUTES = [
//   // Note: Subscription is now a tab in the Dashboard, not a separate route
// ];

// // Admin Routes - Manager role required
// export const ADMIN_ROUTES = [
//   {
//     path: '/admin/subscription',
//     element: <AdminSubscriptionManager />,
//     label: 'Subscription Admin',
//     requiresAuth: true,
//     roles: ['manager', 'admin'],
//     requiredRole: 'manager',
//     inNav: true,
//   },
//   // ✅ NEW: Role Management Routes
//   {
//     path: '/admin/roles',
//     element: <RoleManagementPage />,
//     label: 'Role Management',
//     requiresAuth: true,
//     roles: ['manager', 'admin'],
//     requiredRole: 'manager',
//     inNav: true,
//   },
//   {
//     path: '/admin/permissions',
//     element: <PermissionManagementPage />,
//     label: 'Permission Management',
//     requiresAuth: true,
//     roles: ['manager', 'admin'],
//     requiredRole: 'manager',
//     inNav: true,
//   },
//   {
//     path: '/admin/user-roles',
//     element: <UserRoleAssignmentPage />,
//     label: 'User Role Assignment',
//     requiresAuth: true,
//     roles: ['manager', 'admin'],
//     requiredRole: 'manager',
//     inNav: true,
//   },
//   {
//     path: '/admin/role-history',
//     element: <RoleAssignmentHistoryPage />,
//     label: 'Role History',
//     requiresAuth: true,
//     roles: ['manager', 'admin', 'auditor'],
//     requiredRole: 'manager',
//     requiredRoles: ['manager', 'admin', 'auditor'], // ✅ NEW: Multiple roles support
//     inNav: true,
//   },
// ];

// // Combine all routes
// export const ALL_ROUTES = [
//   ...PUBLIC_ROUTES,
//   ...PROTECTED_ROUTES,
//   ...SUBSCRIPTION_ROUTES,
//   ...ADMIN_ROUTES,
// ];
