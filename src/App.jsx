// src/App.jsx - FIXED VERSION (No Missing Imports)
import './i18n';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './redux/hooks';

// Route Components
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from './components/routes/config';

// Hooks
import { useUserData } from './hooks/useUserData';
import { useUserRoles } from './hooks/useUserRoles';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import PricingPage from './pages/public/PricingPage';
import AboutPage from './pages/public/AboutPage';

// Payment Pages
import StripePaymentPage from './pages/payment/StripePaymentPage';
import PaymentCallback from './pages/payment/PaymentCallback';
import PaddlePaymentPage from './pages/payment/PaddlePaymentPage';

// Subscription
import SubscriptionSync from './components/Dashboard/Tabs/subscription/SubscriptionSync';

// Election Pages
import ElectionView from './pages/election/ElectionView';
import ElectionAccessGuard from './components/voting/ElectionAccessGuard';

// Voting Pages
import VotingPage from './pages/voting/VotingPage';
import VotingMainPage from './pages/voting/VotingMainPage';
import VoteConfirmationPage from './pages/voting/VoteConfirmationPage';
import VerifyVotePage from './pages/voting/VerifyVotePage';

// Dashboard Main Page
import DashboardPage from './pages/DashboardPage';

// ✅ Import Dashboard Tab Components (These exist!)
import Dashboard from './components/Dashboard/Tabs/Dashboard';
import PublicBulletin from './components/Dashboard/Tabs/PublicBulletin';
import VoteNow from './components/Dashboard/Tabs/VoteNow';
import VoteHistory from './components/Dashboard/Tabs/VoteHistory';
import AllElections from './components/Dashboard/Tabs/AllElections';
import MyElections from './components/Dashboard/Tabs/election/MyElections';
import Wallet from './components/Dashboard/Tabs/wallet/Wallet';
import CreatorWallet from './components/Dashboard/Tabs/wallet/CreatorWallet';
import LotteryTickets from './components/Dashboard/Tabs/LotteryTickets';
import Subscription from './components/Dashboard/Tabs/Subscription';
import CreateElection from './components/Dashboard/Tabs/CreateElection';
import VerifyVotes from './components/Dashboard/Tabs/VerifyVotes';
import UserManagement from './components/Dashboard/Tabs/UserManagement';
import AuditTrail from './components/Dashboard/Tabs/AuditTrail';

// ✅ NEW: Import placeholder admin pages
import VoteAuditPage from './pages/superAdmin/VoteAuditPage';
import SecurityLogsPage from './pages/superAdmin/SecurityLogsPage';
import SystemAuditPage from './pages/superAdmin/SystemAuditPage';
import EncryptionStatusPage from './pages/superAdmin/EncryptionStatusPage';
import VerificationToolsPage from './pages/superAdmin/VerificationToolsPage';
import ComplianceReportsPage from './pages/superAdmin/ComplianceReportsPage';
import PaymentGatewaysPage from './pages/superAdmin/PaymentGatewaysPage';
import TransactionMonitoringPage from './pages/superAdmin/TransactionMonitoringPage';
import RevenueAnalyticsPage from './pages/superAdmin/RevenueAnalyticsPage';
import PrizeDistributionPage from './pages/superAdmin/PrizeDistributionPage';
import RegionalPricingPage from './pages/superAdmin/RegionalPricingPage';
import RefundManagementPage from './pages/superAdmin/RefundManagementPage';
import FinancialReportsPage from './pages/superAdmin/FinancialReportsPage';

// Data Loaders
import { loadSubscriptionData } from './utils/loadSubscriptionData';
import { loadElectionData } from './utils/loadElectionData';
import { useNotificationMonitor } from './hooks/useNotificationMonitor';
import ElectionStatsPage from './pages/superAdmin/ElectionStatsPage';
import PaymentSettingsPage from './pages/superAdmin/PaymentSettingsPage';

export default function App() {
  useNotificationMonitor();
  const auth = useAuth();
  useUserData();
  useUserRoles();
  
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userSubscription } = useSelector((state) => state.subscription);
  const { myElections, loading } = useSelector((state) => state.election);

  useEffect(() => {
    if (isAuthenticated && !userSubscription) {
      console.log('🔄 Loading subscription...');
      loadSubscriptionData(dispatch);
    }
  }, [isAuthenticated, userSubscription, dispatch]);

  useEffect(() => {
    if (isAuthenticated && myElections.length === 0 && !loading) {
      console.log('🔄 Loading elections...');
      loadElectionData(dispatch);
    }
  }, [isAuthenticated, dispatch, myElections.length, loading]);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <SubscriptionSync />
      <Routes>
        
        {/* Static Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Payment Pages */}
        <Route path="/payment/stripe" element={<StripePaymentPage />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
        {/* PUBLIC ROUTES from config */}
        {PUBLIC_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* PUBLIC VOTING PAGES */}
        <Route path="/vote/:slug" element={<VotingPage />} />
        <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
        <Route path="/vote/:electionId" element={<VotingMainPage />} />

        {/* Detailed voting view */}
        <Route
          path="/elections/:electionId/vote"
          element={
            <ProtectedRoute>
              <ElectionAccessGuard />
            </ProtectedRoute>
          }
        />

        {/* Vote confirmation */}
        <Route
          path="/elections/:electionId/confirmation"
          element={
            <ProtectedRoute>
              <VoteConfirmationPage />
            </ProtectedRoute>
          }
        />

        {/* ELECTION VIEW ROUTE */}
        <Route
          path="/election/:id"
          element={
            <ProtectedRoute>
              <ElectionView />
            </ProtectedRoute>
          }
        />

        {/* ✅ DASHBOARD with ALL NESTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          {/* ✅ DEFAULT: Dashboard Home */}
          <Route index element={<Dashboard />} />

          {/* ✅ REGULAR USER TABS - NOW WITH ROUTES */}
          <Route path="public-bulletin" element={<PublicBulletin />} />
          <Route path="vote-now" element={<VoteNow />} />
          <Route path="vote-history" element={<VoteHistory />} />
          <Route path="all-elections" element={<AllElections />} />
          <Route path="my-elections" element={<MyElections />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="creator-wallet" element={<CreatorWallet />} />
          <Route path="lottery" element={<LotteryTickets />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="create-election" element={<CreateElection />} />
          <Route path="verify-votes" element={<VerifyVotes />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="audit-trail" element={<AuditTrail />} />

          {/* ✅ EXISTING ADMIN ROUTES from ADMIN_ROUTES config */}
          {ADMIN_ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path.replace('/admin/', 'admin/')} // Convert /admin/x to admin/x
              element={
                <AdminRoute 
                  requiredRole={route.requiredRole}
                  requiredRoles={route.requiredRoles}
                >
                  {route.element}
                </AdminRoute>
              }
            />
          ))}

          {/* ✅ NEW ADMIN ROUTES - Security & Audit */}
           <Route
            path="admin/election-stats"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <ElectionStatsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/vote-audit"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <VoteAuditPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/security-logs"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <SecurityLogsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/system-audit"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <SystemAuditPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/encryption-status"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <EncryptionStatusPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/verification-tools"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <VerificationToolsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/compliance-reports"
            element={
              <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
                <ComplianceReportsPage />
              </AdminRoute>
            }
          />

          {/* ✅ NEW ADMIN ROUTES - Financial Management */}
          <Route
            path="admin/payment-gateways"
            element={
              <AdminRoute requiredRole="Manager">
                <PaymentGatewaysPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/transaction-monitoring"
            element={
              <AdminRoute requiredRole="Manager">
                <TransactionMonitoringPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/revenue-analytics"
            element={
              <AdminRoute requiredRole="Manager">
                <RevenueAnalyticsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/prize-distribution"
            element={
              <AdminRoute requiredRole="Manager">
                <PrizeDistributionPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/regional-pricing"
            element={
              <AdminRoute requiredRole="Manager">
                <RegionalPricingPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/refund-management"
            element={
              <AdminRoute requiredRole="Manager">
                <RefundManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/financial-reports"
            element={
              <AdminRoute requiredRole="Manager">
                <FinancialReportsPage />
              </AdminRoute>
            }
          />

          {/* ✅ NEW: SETTINGS ROUTES */}
          <Route
            path="admin/settings/payment"
            element={
              <AdminRoute requiredRole="Manager">
                <PaymentSettingsPage />
              </AdminRoute>
            }
          />
        </Route>
        

        {/* PROTECTED ROUTES (NOT nested under dashboard) */}
        {PROTECTED_ROUTES.filter(r => r.path !== '/dashboard').map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute>
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}

        {/* CATCH ALL */}
        <Route
          path="*"
          element={
            auth.isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}
//last working code. everything will come through rotue so above code
// // src/App.jsx - COMPLETE FILE WITH NESTED ADMIN ROUTES
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';
// import { PUBLIC_ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from './components/routes/config';

// // Hooks
// import { useUserData } from './hooks/useUserData';
// import { useUserRoles } from './hooks/useUserRoles';

// // Public Pages
// import LandingPage from './pages/public/LandingPage';
// import PricingPage from './pages/public/PricingPage';
// import AboutPage from './pages/public/AboutPage';

// // Payment Pages
// import StripePaymentPage from './pages/payment/StripePaymentPage';
// import PaymentCallback from './pages/payment/PaymentCallback';
// import PaddlePaymentPage from './pages/payment/PaddlePaymentPage';

// // Subscription
// import SubscriptionSync from './components/Dashboard/Tabs/subscription/SubscriptionSync';

// // Election Pages
// import ElectionView from './pages/election/ElectionView';
// import ElectionAccessGuard from './components/voting/ElectionAccessGuard';

// // Voting Pages
// import VotingPage from './pages/voting/VotingPage';
// import VotingMainPage from './pages/voting/VotingMainPage';
// import VoteConfirmationPage from './pages/voting/VoteConfirmationPage';
// import VerifyVotePage from './pages/voting/VerifyVotePage';

// // ✅ Admin Pages (Security & Audit)
// import VoteAuditPage from './pages/superAdmin/VoteAuditPage';
// import SecurityLogsPage from './pages/superAdmin/SecurityLogsPage';
// import SystemAuditPage from './pages/superAdmin/SystemAuditPage';
// import EncryptionStatusPage from './pages/superAdmin/EncryptionStatusPage';
// import VerificationToolsPage from './pages/superAdmin/VerificationToolsPage';
// import ComplianceReportsPage from './pages/superAdmin/ComplianceReportsPage';

// // ✅ Admin Pages (Financial Management)
// import PaymentGatewaysPage from './pages/superAdmin/PaymentGatewaysPage';
// import TransactionMonitoringPage from './pages/superAdmin/TransactionMonitoringPage';
// import RevenueAnalyticsPage from './pages/superAdmin/RevenueAnalyticsPage';
// import PrizeDistributionPage from './pages/superAdmin/PrizeDistributionPage';
// import RegionalPricingPage from './pages/superAdmin/RegionalPricingPage';
// import RefundManagementPage from './pages/superAdmin/RefundManagementPage';
// import FinancialReportsPage from './pages/superAdmin/FinancialReportsPage';

// // Data Loaders
// import { loadSubscriptionData } from './utils/loadSubscriptionData';
// import { loadElectionData } from './utils/loadElectionData';
// import DashboardPage from './pages/DashboardPage';

// export default function App() {
//   const auth = useAuth();
//   useUserData();
//   useUserRoles();
  
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);
//   const { myElections, loading } = useSelector((state) => state.election);

//   useEffect(() => {
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 Loading subscription...');
//       loadSubscriptionData(dispatch);
//     }
//   }, [isAuthenticated, userSubscription, dispatch]);

//   useEffect(() => {
//     if (isAuthenticated && myElections.length === 0 && !loading) {
//       console.log('🔄 Loading elections...');
//       loadElectionData(dispatch);
//     }
//   }, [isAuthenticated, dispatch, myElections.length, loading]);

//   return (
//     <Router>
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//       <SubscriptionSync />
//       <Routes>
        
//         {/* Static Public Pages */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/pricing" element={<PricingPage />} />
//         <Route path="/about" element={<AboutPage />} />
        
//         {/* Payment Pages */}
//         <Route path="/payment/stripe" element={<StripePaymentPage />} />
//         <Route path="/payment/callback" element={<PaymentCallback />} />
//         <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
//         {/* PUBLIC ROUTES from config */}
//         {PUBLIC_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={route.element}
//           />
//         ))}

//         {/* PUBLIC VOTING PAGES */}
//         <Route path="/vote/:slug" element={<VotingPage />} />
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />

//         {/* Detailed voting view with payment/auth/video checks */}
//         <Route
//           path="/elections/:electionId/vote"
//           element={
//             <ProtectedRoute>
//               <ElectionAccessGuard />
//             </ProtectedRoute>
//           }
//         />

//         {/* Vote confirmation/success page */}
//         <Route
//           path="/elections/:electionId/confirmation"
//           element={
//             <ProtectedRoute>
//               <VoteConfirmationPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* ELECTION VIEW ROUTE */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* ✅ DASHBOARD with NESTED ADMIN ROUTES (NO REMOUNTING!) */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <DashboardPage />
//             </ProtectedRoute>
//           }
//         >
//           {/* ✅ ADMIN Section Routes (Manager Only) - Using relative paths */}
//           <Route
//             path="admin/subscription"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 {ADMIN_ROUTES.find(r => r.path === '/admin/subscription')?.element}
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/roles"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 {ADMIN_ROUTES.find(r => r.path === '/admin/roles')?.element}
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/permissions"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 {ADMIN_ROUTES.find(r => r.path === '/admin/permissions')?.element}
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/user-roles"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 {ADMIN_ROUTES.find(r => r.path === '/admin/user-roles')?.element}
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/role-history"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 {ADMIN_ROUTES.find(r => r.path === '/admin/role-history')?.element}
//               </AdminRoute>
//             }
//           />

//           {/* ✅ SECURITY & AUDIT Routes (Manager/Admin/Auditor) */}
//           <Route
//             path="admin/vote-audit"
//             element={
//               <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//                 <VoteAuditPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/security-logs"
//             element={
//               <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//                 <SecurityLogsPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/system-audit"
//             element={
//               <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//                 <SystemAuditPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/encryption-status"
//             element={
//               <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//                 <EncryptionStatusPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/verification-tools"
//             element={
//               <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//                 <VerificationToolsPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/compliance-reports"
//             element={
//               <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//                 <ComplianceReportsPage />
//               </AdminRoute>
//             }
//           />

//           {/* ✅ FINANCIAL MANAGEMENT Routes (Manager Only) */}
//           <Route
//             path="admin/payment-gateways"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <PaymentGatewaysPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/transaction-monitoring"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <TransactionMonitoringPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/revenue-analytics"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <RevenueAnalyticsPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/prize-distribution"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <PrizeDistributionPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/regional-pricing"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <RegionalPricingPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/refund-management"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <RefundManagementPage />
//               </AdminRoute>
//             }
//           />
//           <Route
//             path="admin/financial-reports"
//             element={
//               <AdminRoute requiredRole="Manager">
//                 <FinancialReportsPage />
//               </AdminRoute>
//             }
//           />
//         </Route>

//         {/* PROTECTED ROUTES (NOT nested under dashboard) */}
//         {PROTECTED_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={
//               <ProtectedRoute>
//                 {route.element}
//               </ProtectedRoute>
//             }
//           />
//         ))}

//         {/* CATCH ALL */}
//         <Route
//           path="*"
//           element={
//             auth.isAuthenticated
//               ? <Navigate to="/dashboard" replace />
//               : <Navigate to="/" replace />
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }
// // src/App.jsx - UPDATED WITH ADMIN LAYOUT
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';
// import { PUBLIC_ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from './components/routes/config';

// // Hooks
// import { useUserData } from './hooks/useUserData';
// import { useUserRoles } from './hooks/useUserRoles';

// // Layouts
// //import AdminLayout from './components/layouts/AdminLayout'; // ✅ NEW

// // Public Pages
// import LandingPage from './pages/public/LandingPage';
// import PricingPage from './pages/public/PricingPage';
// import AboutPage from './pages/public/AboutPage';

// // Payment Pages
// import StripePaymentPage from './pages/payment/StripePaymentPage';
// import PaymentCallback from './pages/payment/PaymentCallback';
// import PaddlePaymentPage from './pages/payment/PaddlePaymentPage';

// // Subscription
// import SubscriptionSync from './components/Dashboard/Tabs/subscription/SubscriptionSync';

// // Election Pages
// import ElectionView from './pages/election/ElectionView';
// import ElectionAccessGuard from './components/voting/ElectionAccessGuard';

// // Voting Pages
// import VotingPage from './pages/voting/VotingPage';
// import VotingMainPage from './pages/voting/VotingMainPage';
// import VoteConfirmationPage from './pages/voting/VoteConfirmationPage';
// import VerifyVotePage from './pages/voting/VerifyVotePage';

// // ✅ NEW: Admin Pages
// //import VoteAuditPage from './pages/admin/VoteAuditPage';
// import VoteAuditPage from './pages/superAdmin/VoteAuditPage';
// //import SecurityLogsPage from './pages/admin/SecurityLogsPage';
// //import SystemAuditPage from './pages/admin/SystemAuditPage';
// //import EncryptionStatusPage from './pages/admin/EncryptionStatusPage';
// //import VerificationToolsPage from './pages/admin/VerificationToolsPage';
// //import ComplianceReportsPage from './pages/admin/ComplianceReportsPage';
// //import PaymentGatewaysPage from './pages/admin/PaymentGatewaysPage';
// //import TransactionMonitoringPage from './pages/admin/TransactionMonitoringPage';
// //import RevenueAnalyticsPage from './pages/admin/RevenueAnalyticsPage';
// //import PrizeDistributionPage from './pages/admin/PrizeDistributionPage';
// //import RegionalPricingPage from './pages/admin/RegionalPricingPage';
// //import RefundManagementPage from './pages/admin/RefundManagementPage';
// //import FinancialReportsPage from './pages/admin/FinancialReportsPage';

// // Data Loaders
// import { loadSubscriptionData } from './utils/loadSubscriptionData';
// import { loadElectionData } from './utils/loadElectionData';
// import AdminLayout from './components/Layout/AdminLayout';
// import SecurityLogsPage from './pages/superAdmin/SecurityLogsPage';
// import SystemAuditPage from './pages/superAdmin/SystemAuditPage';
// import EncryptionStatusPage from './pages/superAdmin/EncryptionStatusPage';
// import VerificationToolsPage from './pages/superAdmin/VerificationToolsPage';
// import ComplianceReportsPage from './pages/superAdmin/ComplianceReportsPage';
// import PaymentGatewaysPage from './pages/superAdmin/PaymentGatewaysPage';
// import TransactionMonitoringPage from './pages/superAdmin/TransactionMonitoringPage';
// import RevenueAnalyticsPage from './pages/superAdmin/RevenueAnalyticsPage';
// import PrizeDistributionPage from './pages/superAdmin/PrizeDistributionPage';
// import RegionalPricingPage from './pages/superAdmin/RegionalPricingPage';
// import RefundManagementPage from './pages/superAdmin/RefundManagementPage';
// import FinancialReportsPage from './pages/superAdmin/FinancialReportsPage';


// export default function App() {
//   const auth = useAuth();
//   useUserData();
//   useUserRoles();
  
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);
//   const { myElections, loading } = useSelector((state) => state.election);

//   useEffect(() => {
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 Loading subscription...');
//       loadSubscriptionData(dispatch);
//     }
//   }, [isAuthenticated, userSubscription, dispatch]);

//   useEffect(() => {
//     if (isAuthenticated && myElections.length === 0 && !loading) {
//       console.log('🔄 Loading elections...');
//       loadElectionData(dispatch);
//     }
//   }, [isAuthenticated, dispatch]);

//   return (
//     <Router>
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//       <SubscriptionSync />
//       <Routes>
        
//         {/* Static Public Pages */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/pricing" element={<PricingPage />} />
//         <Route path="/about" element={<AboutPage />} />
        
//         {/* Payment Pages */}
//         <Route path="/payment/stripe" element={<StripePaymentPage />} />
//         <Route path="/payment/callback" element={<PaymentCallback />} />
//         <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
//         {/* PUBLIC ROUTES from config */}
//         {PUBLIC_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={route.element}
//           />
//         ))}

//         {/* PUBLIC VOTING PAGES */}
//         <Route path="/vote/:slug" element={<VotingPage />} />
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />

//         {/* Detailed voting view with payment/auth/video checks */}
//         <Route
//           path="/elections/:electionId/vote"
//           element={
//             <ProtectedRoute>
//               <ElectionAccessGuard />
//             </ProtectedRoute>
//           }
//         />

//         {/* Vote confirmation/success page */}
//         <Route
//           path="/elections/:electionId/confirmation"
//           element={
//             <ProtectedRoute>
//               <VoteConfirmationPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* ELECTION VIEW ROUTE */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROTECTED ROUTES */}
//         {PROTECTED_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={
//               <ProtectedRoute>
//                 {route.element}
//               </ProtectedRoute>
//             }
//           />
//         ))}

//         {/* ✅ NEW: SECURITY & AUDIT ROUTES (Manager/Admin/Auditor) */}
//         <Route
//           path="/admin/vote-audit"
//           element={
//             <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//               <AdminLayout>
//                 <VoteAuditPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/security-logs"
//           element={
//             <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//               <AdminLayout>
//                 <SecurityLogsPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/system-audit"
//           element={
//             <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//               <AdminLayout>
//                 <SystemAuditPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/encryption-status"
//           element={
//             <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//               <AdminLayout>
//                 <EncryptionStatusPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/verification-tools"
//           element={
//             <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//               <AdminLayout>
//                 <VerificationToolsPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/compliance-reports"
//           element={
//             <AdminRoute requiredRoles={['Manager', 'Admin', 'Auditor']}>
//               <AdminLayout>
//                 <ComplianceReportsPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />

//         {/* ✅ NEW: FINANCIAL MANAGEMENT ROUTES (Manager only) */}
//         <Route
//           path="/admin/payment-gateways"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <PaymentGatewaysPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/transaction-monitoring"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <TransactionMonitoringPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/revenue-analytics"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <RevenueAnalyticsPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/prize-distribution"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <PrizeDistributionPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/regional-pricing"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <RegionalPricingPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/refund-management"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <RefundManagementPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />
//         <Route
//           path="/admin/financial-reports"
//           element={
//             <AdminRoute requiredRole="Manager">
//               <AdminLayout>
//                 <FinancialReportsPage />
//               </AdminLayout>
//             </AdminRoute>
//           }
//         />

//         {/* EXISTING ADMIN ROUTES (from config) */}
//         {ADMIN_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={
//               <AdminRoute 
//                 requiredRole={route.requiredRole}
//                 requiredRoles={route.requiredRoles}
//               >
//                 <AdminLayout>
//                   {route.element}
//                 </AdminLayout>
//               </AdminRoute>
//             }
//           />
//         ))}

//         {/* CATCH ALL */}
//         <Route
//           path="*"
//           element={
//             auth.isAuthenticated
//               ? <Navigate to="/dashboard" replace />
//               : <Navigate to="/" replace />
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }
//last workable code. just to add admin layout and sidebar above code
// // src/App.js - WITH ROLE MANAGEMENT + ELECTION ACCESS GUARD INTEGRATION
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';
// import { PUBLIC_ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from './components/routes/config';

// // Hooks
// import { useUserData } from './hooks/useUserData';
// import { useUserRoles } from './hooks/useUserRoles';

// // Public Pages
// import LandingPage from './pages/public/LandingPage';
// import PricingPage from './pages/public/PricingPage';
// import AboutPage from './pages/public/AboutPage';

// // Payment Pages
// import StripePaymentPage from './pages/payment/StripePaymentPage';
// import PaymentCallback from './pages/payment/PaymentCallback';
// import PaddlePaymentPage from './pages/payment/PaddlePaymentPage';

// // Subscription
// import SubscriptionSync from './components/Dashboard/Tabs/subscription/SubscriptionSync';

// // Election Pages
// import ElectionView from './pages/election/ElectionView';
// //import ElectionAccessGuard from './components/voting/ElectionAccessGuard'; // ✅ NEW: Access guard wrapper

// // Voting Pages
// import VotingPage from './pages/voting/VotingPage';
// import VotingMainPage from './pages/voting/VotingMainPage';
// import VoteConfirmationPage from './pages/voting/VoteConfirmationPage';
// import VerifyVotePage from './pages/voting/VerifyVotePage';

// // Data Loaders
// import { loadSubscriptionData } from './utils/loadSubscriptionData';
// import { loadElectionData } from './utils/loadElectionData';
// import ElectionAccessGuard from './components/voting/ElectionAccessGuard';

// export default function App() {
//   const auth = useAuth();
//   useUserData();
//   useUserRoles();
  
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);
//   const { myElections, loading } = useSelector((state) => state.election);

//   // Load subscription data once
//   useEffect(() => {
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 Loading subscription...');
//       loadSubscriptionData(dispatch);
//     }
//   }, [isAuthenticated, userSubscription, dispatch]);

//   // Load elections once
//   useEffect(() => {
//     if (isAuthenticated && myElections.length === 0 && !loading) {
//       console.log('🔄 Loading elections...');
//       loadElectionData(dispatch);
//     }
//   }, [isAuthenticated, dispatch]);

//   return (
//     <Router>
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//       <SubscriptionSync />
//       <Routes>
        
//         {/* Static Public Pages */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/pricing" element={<PricingPage />} />
//         <Route path="/about" element={<AboutPage />} />
        
//         {/* Payment Pages */}
//         <Route path="/payment/stripe" element={<StripePaymentPage />} />
//         <Route path="/payment/callback" element={<PaymentCallback />} />
//         <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
//         {/* PUBLIC ROUTES from config */}
//         {PUBLIC_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={route.element}
//           />
//         ))}

//         {/* PUBLIC VOTING PAGES */}
//         <Route path="/vote/:slug" element={<VotingPage />} />
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />


        
//         {/* Detailed voting view with payment/auth/video checks */}
//         <Route
//           path="/elections/:electionId/vote"
//           element={
//             <ProtectedRoute>
//               <ElectionAccessGuard />
//             </ProtectedRoute>
//           }
//         />

//         {/* Vote confirmation/success page */}
//         <Route
//           path="/elections/:electionId/confirmation"
//           element={
//             <ProtectedRoute>
//               <VoteConfirmationPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* ========================================
//             EXISTING ROUTES BELOW (UNCHANGED)
//         ======================================== */}

//         {/* ELECTION VIEW ROUTE */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROTECTED ROUTES */}
//         {PROTECTED_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={
//               <ProtectedRoute>
//                 {route.element}
//               </ProtectedRoute>
//             }
//           />
//         ))}

//         {/* ADMIN ROUTES */}
//         {ADMIN_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={
//               <AdminRoute 
//                 requiredRole={route.requiredRole}
//                 requiredRoles={route.requiredRoles}
//               >
//                 {route.element}
//               </AdminRoute>
//             }
//           />
//         ))}

//         {/* CATCH ALL */}
//         <Route
//           path="*"
//           element={
//             auth.isAuthenticated
//               ? <Navigate to="/dashboard" replace />
//               : <Navigate to="/" replace />
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }
