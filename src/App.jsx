// src/App.js - WITH ROLE MANAGEMENT INTEGRATION ADDED (ALL EXISTING ROUTES PRESERVED)
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
import { useUserRoles } from './hooks/useUserRoles'; // ✅ NEW: Role management hook

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
import ElectionVotingView from './pages/election/ElectionVotingView';

// Voting Pages
import VotingPage from './pages/voting/VotingPage';
import VotingMainPage from './pages/voting/VotingMainPage';
import VoteConfirmationPage from './pages/voting/VoteConfirmationPage';
import VerifyVotePage from './pages/voting/VerifyVotePage';

// Data Loaders
import { loadSubscriptionData } from './utils/loadSubscriptionData';
import { loadElectionData } from './utils/loadElectionData';

export default function App() {
  const auth = useAuth();
  useUserData();
  useUserRoles(); // ✅ NEW: Load user roles on app start
  
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userSubscription } = useSelector((state) => state.subscription);
  const { myElections, loading } = useSelector((state) => state.election);

  // ✅ SIMPLE FIX: Load subscription data once
  useEffect(() => {
    if (isAuthenticated && !userSubscription) {
      console.log('🔄 Loading subscription...');
      loadSubscriptionData(dispatch);
    }
  }, [isAuthenticated, userSubscription, dispatch]);

  // ✅ SIMPLE FIX: Load elections once - check loading flag
  useEffect(() => {
    // Only load if:
    // 1. User is authenticated
    // 2. No elections loaded yet
    // 3. Not currently loading
    if (isAuthenticated && myElections.length === 0 && !loading) {
      console.log('🔄 Loading elections...');
      loadElectionData(dispatch);
    }
  }, [isAuthenticated, dispatch]); // ✅ ONLY these dependencies!

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

        {/* ========================================
            ✅ NEW VOTING ROUTES ADDED BELOW
        ======================================== */}
        
        {/* Detailed voting view with payment (Protected) */}
        <Route
          path="/elections/:electionId/vote"
          element={
            <ProtectedRoute>
              <ElectionVotingView />
            </ProtectedRoute>
          }
        />

        {/* Vote confirmation/success page (Protected) */}
        <Route
          path="/elections/:electionId/confirmation"
          element={
            <ProtectedRoute>
              <VoteConfirmationPage />
            </ProtectedRoute>
          }
        />

        {/* ========================================
            EXISTING ROUTES BELOW (UNCHANGED)
        ======================================== */}

        {/* ELECTION VIEW ROUTE */}
        <Route
          path="/election/:id"
          element={
            <ProtectedRoute>
              <ElectionView />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTES */}
        {PROTECTED_ROUTES.map((route) => (
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

        {/* ADMIN ROUTES - ✅ UPDATED to support requiredRoles */}
        {ADMIN_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
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
//last workable code
// // src/App.js - WITH NEW VOTING ROUTES ADDED (ALL EXISTING ROUTES PRESERVED)
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
// import ElectionVotingView from './pages/election/ElectionVotingView'; // ✅ NEW

// // Voting Pages
// import VotingPage from './pages/voting/VotingPage';
// import VotingMainPage from './pages/voting/VotingMainPage';
// import VoteConfirmationPage from './pages/voting/VoteConfirmationPage'; // ✅ NEW
// import VerifyVotePage from './pages/voting/VerifyVotePage';

// // Data Loaders
// import { loadSubscriptionData } from './utils/loadSubscriptionData';
// import { loadElectionData } from './utils/loadElectionData';

// export default function App() {
//   const auth = useAuth();
//   useUserData();
  
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);
//   const { myElections, loading } = useSelector((state) => state.election);

//   // ✅ SIMPLE FIX: Load subscription data once
//   useEffect(() => {
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 Loading subscription...');
//       loadSubscriptionData(dispatch);
//     }
//   }, [isAuthenticated, userSubscription, dispatch]);

//   // ✅ SIMPLE FIX: Load elections once - check loading flag
//   useEffect(() => {
//     // Only load if:
//     // 1. User is authenticated
//     // 2. No elections loaded yet
//     // 3. Not currently loading
//     if (isAuthenticated && myElections.length === 0 && !loading) {
//       console.log('🔄 Loading elections...');
//       loadElectionData(dispatch);
//     }
//   }, [isAuthenticated, dispatch]); // ✅ ONLY these dependencies!

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

//         {/* ========================================
//             ✅ NEW VOTING ROUTES ADDED BELOW
//         ======================================== */}
        
//         {/* Detailed voting view with payment (Protected) */}
//         <Route
//           path="/elections/:electionId/vote"
//           element={
//             <ProtectedRoute>
//               <ElectionVotingView />
//             </ProtectedRoute>
//           }
//         />

//         {/* Vote confirmation/success page (Protected) */}
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
//               <AdminRoute requiredRole={route.requiredRole}>
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
