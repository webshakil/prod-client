// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './redux/hooks';

// Route Components
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

// Route Configuration - Import from correct path
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from './components/routes/config';

// Hooks
import { useUserData } from './hooks/useUserData';

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

// ✅ VOTING PAGES - Both old and new
import VotingPage from './pages/voting/VotingPage';
import VotingMainPage from './pages/voting/VotingMainPage';
import VerifyVotePage from './pages/voting/VerifyVotePage';

// 🆕 GLOBAL DATA LOADERS
import { loadSubscriptionData } from './utils/loadSubscriptionData';
import { loadElectionData } from './utils/loadElectionData';

export default function App() {
  const auth = useAuth();
  useUserData();
  
  // 🆕 GLOBAL DATA LOADING
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userSubscription } = useSelector((state) => state.subscription);
  const { myElections } = useSelector((state) => state.election);

  // 🆕 Load subscription data when user is authenticated
  useEffect(() => {
    console.log('🔍 [App.js] Subscription Effect - isAuthenticated:', isAuthenticated);
    console.log('🔍 [App.js] Subscription Effect - userSubscription:', userSubscription);
    
    if (isAuthenticated && !userSubscription) {
      console.log('🔄 [App.js] Loading subscription data globally...');
      loadSubscriptionData(dispatch);
    } else if (isAuthenticated && userSubscription) {
      console.log('✅ [App.js] Subscription already loaded, skipping');
    } else {
      console.log('⏸️ [App.js] Not authenticated, skipping subscription load');
    }
  }, [isAuthenticated, dispatch, userSubscription]);

  // 🆕 Load election data when user is authenticated
  useEffect(() => {
    console.log('🔍 [App.js] Election Effect - isAuthenticated:', isAuthenticated);
    console.log('🔍 [App.js] Election Effect - myElections.length:', myElections.length);
    
    if (isAuthenticated && myElections.length === 0) {
      console.log('🔄 [App.js] Loading election data globally...');
      loadElectionData(dispatch);
    } else if (isAuthenticated && myElections.length > 0) {
      console.log('✅ [App.js] Elections already loaded:', myElections.length);
    } else {
      console.log('⏸️ [App.js] Not authenticated, skipping election load');
    }
  }, [isAuthenticated, dispatch, myElections.length]);

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

        {/* ✅ PUBLIC VOTING PAGE by slug - Anyone can access (logged in or not) */}
        <Route path="/vote/:slug" element={<VotingPage />} />

        {/* ✅ VERIFY VOTE PAGE - Public verification */}
        <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
        
        {/* ✅ NEW VOTING PAGE by ID - Enhanced with wallet/lottery/payment features (keeps existing behavior) */}
        <Route path="/vote/:electionId" element={<VotingMainPage />} />

        {/* ELECTION VIEW ROUTE - Protected */}
        <Route
          path="/election/:id"
          element={
            <ProtectedRoute>
              <ElectionView />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED ROUTES from config */}
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

        {/* ADMIN ROUTES from config */}
        {ADMIN_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AdminRoute requiredRole={route.requiredRole}>
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
// // src/App.js
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';

// // Route Configuration - Import from correct path
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

// // ✅ VOTING PAGES - Both old and new
// import VotingPage from './pages/voting/VotingPage';
// import VotingMainPage from './pages/voting/VotingMainPage';
// import VerifyVotePage from './pages/voting/VerifyVotePage';

// // 🆕 GLOBAL DATA LOADERS
// import { loadSubscriptionData } from './utils/loadSubscriptionData';
// import { loadElectionData } from './utils/loadElectionData';

// export default function App() {
//   const auth = useAuth();
//   useUserData();
  
//   // 🆕 GLOBAL DATA LOADING
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);
//   const { myElections } = useSelector((state) => state.election);

//   // 🆕 Load subscription data when user is authenticated
//   useEffect(() => {
//     console.log('🔍 [App.js] Subscription Effect - isAuthenticated:', isAuthenticated);
//     console.log('🔍 [App.js] Subscription Effect - userSubscription:', userSubscription);
    
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 [App.js] Loading subscription data globally...');
//       loadSubscriptionData(dispatch);
//     } else if (isAuthenticated && userSubscription) {
//       console.log('✅ [App.js] Subscription already loaded, skipping');
//     } else {
//       console.log('⏸️ [App.js] Not authenticated, skipping subscription load');
//     }
//   }, [isAuthenticated, dispatch, userSubscription]);

//   // 🆕 Load election data when user is authenticated
//   useEffect(() => {
//     console.log('🔍 [App.js] Election Effect - isAuthenticated:', isAuthenticated);
//     console.log('🔍 [App.js] Election Effect - myElections.length:', myElections.length);
    
//     if (isAuthenticated && myElections.length === 0) {
//       console.log('🔄 [App.js] Loading election data globally...');
//       loadElectionData(dispatch);
//     } else if (isAuthenticated && myElections.length > 0) {
//       console.log('✅ [App.js] Elections already loaded:', myElections.length);
//     } else {
//       console.log('⏸️ [App.js] Not authenticated, skipping election load');
//     }
//   }, [isAuthenticated, dispatch, myElections.length]);

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

//         {/* ✅ EXISTING VOTING PAGE - Your current shareable election page */}
//         <Route path="/vote/:slug" element={<VotingPage />} />
//         {/* <Route path="/vote-old/:slug" element={<VotingPage />} /> */}

//         {/* ✅ NEW VOTING PAGE - Enhanced with wallet/lottery/payment features */}
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />

//         {/* ✅ NEW VERIFY VOTE PAGE - Public verification */}
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
        

//         {/* ELECTION VIEW ROUTE - Protected */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROTECTED ROUTES from config */}
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

//         {/* ADMIN ROUTES from config */}
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
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';

// // Route Configuration - Import from correct path
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

// // ✅ VOTING PAGES - Both old and new
// import VotingPage from './pages/voting/VotingPage';                // Existing shareable election page
// import VotingMainPage from './pages/voting/VotingMainPage';        // NEW with wallet/lottery features
// import VerifyVotePage from './pages/voting/VerifyVotePage';        // NEW verification page

// // 🆕 GLOBAL DATA LOADERS
// import { loadSubscriptionData } from './utils/loadSubscriptionData';
// import { loadElectionData } from './utils/loadElectionData';

// export default function App() {
//   const auth = useAuth();
//   useUserData();
  
//   // 🆕 GLOBAL DATA LOADING
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);
//   const { myElections } = useSelector((state) => state.election);

//   // 🆕 Load subscription data when user is authenticated
//   useEffect(() => {
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 Loading subscription data globally in App.js...');
//       loadSubscriptionData(dispatch);
//     }
//   }, [isAuthenticated, dispatch]);

//   // 🆕 Load election data when user is authenticated
//   useEffect(() => {
//     if (isAuthenticated && myElections.length === 0) {
//       console.log('🔄 Loading election data globally in App.js...');
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

//         {/* ✅ EXISTING VOTING PAGE - Your current shareable election page */}
//         {/* this below code creates succssful shareable eleciton */}
//         {/* <Route path="/vote/:slug" element={<VotingPage />} /> */}
//         <Route path="/vote-old/:slug" element={<VotingPage />} />

//         {/* ✅ NEW VOTING PAGE - Enhanced with wallet/lottery/payment features */}
//         {/* <Route path="/vote-new/:slug" element={<VotingMainPage />} /> */}
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />

//         {/* ✅ NEW VERIFY VOTE PAGE - Public verification */}
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
        

//         {/* ELECTION VIEW ROUTE - Protected */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROTECTED ROUTES from config */}
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

//         {/* ADMIN ROUTES from config */}
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
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';

// // Route Configuration - Import from correct path
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

// // ✅ VOTING PAGES - Both old and new
// import VotingPage from './pages/voting/VotingPage';                // Existing shareable election page
// import VotingMainPage from './pages/voting/VotingMainPage';        // NEW with wallet/lottery features
// import VerifyVotePage from './pages/voting/VerifyVotePage';        // NEW verification page

// // 🆕 GLOBAL SUBSCRIPTION LOADER
// import { loadSubscriptionData } from './utils/loadSubscriptionData';

// export default function App() {
//   const auth = useAuth();
//   useUserData();
  
//   // 🆕 GLOBAL SUBSCRIPTION DATA LOADING
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const { userSubscription } = useSelector((state) => state.subscription);

//   // 🆕 Load subscription data when user is authenticated
//   useEffect(() => {
//     if (isAuthenticated && !userSubscription) {
//       console.log('🔄 Loading subscription data globally in App.js...');
//       loadSubscriptionData(dispatch);
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

//         {/* ✅ EXISTING VOTING PAGE - Your current shareable election page */}
//         {/* this below code creates succssful shareable eleciton */}
//         {/* <Route path="/vote/:slug" element={<VotingPage />} /> */}
//         <Route path="/vote-old/:slug" element={<VotingPage />} />

//         {/* ✅ NEW VOTING PAGE - Enhanced with wallet/lottery/payment features */}
//         {/* <Route path="/vote-new/:slug" element={<VotingMainPage />} /> */}
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />

//         {/* ✅ NEW VERIFY VOTE PAGE - Public verification */}
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
        

//         {/* ELECTION VIEW ROUTE - Protected */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROTECTED ROUTES from config */}
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

//         {/* ADMIN ROUTES from config */}
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
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';

// // Route Configuration - Import from correct path
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

// // ✅ VOTING PAGES - Both old and new
// import VotingPage from './pages/voting/VotingPage';                // Existing shareable election page
// import VotingMainPage from './pages/voting/VotingMainPage';        // NEW with wallet/lottery features
// import VerifyVotePage from './pages/voting/VerifyVotePage';        // NEW verification page

// export default function App() {
//   const auth = useAuth();
//   useUserData();

  

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

//         {/* ✅ EXISTING VOTING PAGE - Your current shareable election page */}
//         {/* this below code creates succssful shareable eleciton */}
//         {/* <Route path="/vote/:slug" element={<VotingPage />} /> */}
//         <Route path="/vote-old/:slug" element={<VotingPage />} />

//         {/* ✅ NEW VOTING PAGE - Enhanced with wallet/lottery/payment features */}
//         {/* <Route path="/vote-new/:slug" element={<VotingMainPage />} /> */}
//         <Route path="/vote/:electionId" element={<VotingMainPage />} />

//         {/* ✅ NEW VERIFY VOTE PAGE - Public verification */}
//         <Route path="/verify/:receiptId" element={<VerifyVotePage />} />
        

//         {/* ELECTION VIEW ROUTE - Protected */}
//         <Route
//           path="/election/:id"
//           element={
//             <ProtectedRoute>
//               <ElectionView />
//             </ProtectedRoute>
//           }
//         />

//         {/* PROTECTED ROUTES from config */}
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

//         {/* ADMIN ROUTES from config */}
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
// //last workable code
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useAuth } from './redux/hooks';

// // Route Components
// import ProtectedRoute from './components/routes/ProtectedRoute';
// import AdminRoute from './components/routes/AdminRoute';

// // Route Configuration - Import from correct path
// import { PUBLIC_ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from './components/routes/config';

// // Hooks
// import { useUserData } from './hooks/useUserData';
// import LandingPage from './pages/public/LandingPage';
// import PricingPage from './pages/public/PricingPage';
// import AboutPage from './pages/public/AboutPage';
// import StripePaymentPage from './pages/payment/StripePaymentPage';
// import PaymentCallback from './pages/payment/PaymentCallback';
// import PaddlePaymentPage from './pages/payment/PaddlePaymentPage';
// import SubscriptionSync from './components/Dashboard/Tabs/subscription/SubscriptionSync';
// import ElectionView from './pages/election/ElectionView';
// import VotingPage from './pages/voting/VotingPage';


// // Election View Page
// //import ElectionView from './pages/ElectionView';

// export default function App() {
//   const auth = useAuth();
//   useUserData();

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
        
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/pricing" element={<PricingPage />} />
//         <Route path="/about" element={<AboutPage />} />
//         <Route path="/payment/stripe" element={<StripePaymentPage />} />
//         <Route path="/payment/callback" element={<PaymentCallback />} />
//         <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
//         {/* PUBLIC ROUTES */}
//         {PUBLIC_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={route.element}
//           />
//         ))}

//         {/* VOTING PAGE - Public shareable route */}
//         <Route path="/vote/:slug" element={<VotingPage />} />

//         {/* ELECTION VIEW ROUTE - Protected */}
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
