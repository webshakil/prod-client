import React from 'react';
import AuthPage from '../../pages/AuthPage';
import DashboardPage from '../../pages/DashboardPage';
import ProfilePage from '../Profile/ProfilePage';
import AdminSubscriptionManager from '../../pages/admin/AdminSubscriptionManager';

// Public Routes - No authentication required
export const PUBLIC_ROUTES = [
  {
    path: '/auth',
    element: <AuthPage />,
    label: 'Authentication',
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
];

// Combine all routes
export const ALL_ROUTES = [
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...SUBSCRIPTION_ROUTES,
  ...ADMIN_ROUTES,
];
// import React from 'react';
// import AuthPage from '../../pages/AuthPage';
// import DashboardPage from '../../pages/DashboardPage';
// import ProfilePage from '../Profile/ProfilePage';
// import AdminSubscriptionDashboard from '../../pages/admin/AdminSubscriptionDashboard';
// import AdminPlanManager from '../../pages/admin/AdminPlanManager';
// import AdminGatewayConfig from '../../pages/admin/AdminGatewayConfig';
// import AdminRegionalPricing from '../../pages/admin/AdminRegionalPricing';

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

// // ✅ ADD THIS - Subscription Routes (integrated into Dashboard tab)
// export const SUBSCRIPTION_ROUTES = [
//   // Note: Subscription is now a tab in the Dashboard, not a separate route
//   // This is kept for consistency with the guards structure
// ];

// // Admin Routes - Manager role required
// export const ADMIN_ROUTES = [
//   {
//     path: '/admin/subscription',
//     element: <AdminSubscriptionDashboard />,
//     label: 'Subscription Admin',
//     requiresAuth: true,
//     roles: ['manager', 'admin'],
//     requiredRole: 'manager',
//     inNav: true,
//   },
//   {
//     path: '/admin/subscription/plans',
//     element: <AdminPlanManager />,
//     label: 'Manage Plans',
//     requiresAuth: true,
//     roles: ['manager'],
//     requiredRole: 'manager',
//     inNav: false,
//   },
//   {
//     path: '/admin/subscription/gateway-config',
//     element: <AdminGatewayConfig />,
//     label: 'Gateway Config',
//     requiresAuth: true,
//     roles: ['manager'],
//     requiredRole: 'manager',
//     inNav: false,
//   },
//   {
//     path: '/admin/subscription/regional-pricing',
//     element: <AdminRegionalPricing />,
//     label: 'Regional Pricing',
//     requiresAuth: true,
//     roles: ['manager'],
//     requiredRole: 'manager',
//     inNav: false,
//   },
// ];

// // ✅ ADD THIS - Combine all routes
// export const ALL_ROUTES = [
//   ...PUBLIC_ROUTES,
//   ...PROTECTED_ROUTES,
//   ...SUBSCRIPTION_ROUTES,
//   ...ADMIN_ROUTES,
// ];
// import React from 'react';
// //import AuthPage from '../pages/AuthPage';
// //import DashboardPage from '../pages/DashboardPage';
// //import ProfilePage from '../components/Profile/ProfilePage';
// //import AdminSubscriptionDashboard from '../pages/admin/AdminSubscriptionDashboard';
// import AuthPage from '../../pages/AuthPage';
// import DashboardPage from '../../pages/DashboardPage';
// import ProfilePage from '../Profile/ProfilePage';
// import AdminSubscriptionDashboard from '../../pages/admin/AdminSubscriptionDashboard';

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

// // Admin Routes - Manager role required
// export const ADMIN_ROUTES = [
//   {
//     path: '/admin/subscription',
//     element: <AdminSubscriptionDashboard />,
//     label: 'Subscription Admin',
//     requiresAuth: true,
//     roles: ['manager', 'admin'],
//     requiredRole: 'manager',
//     inNav: true,
//   },
// ];

// export const ALL_ROUTES = [
//   ...PUBLIC_ROUTES,
//   ...PROTECTED_ROUTES,
//   ...ADMIN_ROUTES,
// ];