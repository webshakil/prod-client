import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import LandingPage from './pages/public/LandingPage';
import PricingPage from './pages/public/PricingPage';
import AboutPage from './pages/public/AboutPage';
import StripePaymentPage from './pages/payment/StripePaymentPage';
import PaymentCallback from './pages/payment/PaymentCallback';
import PaddlePaymentPage from './pages/payment/PaddlePaymentPage';
import SubscriptionSync from './components/Dashboard/Tabs/subscription/SubscriptionSync';
import ElectionView from './pages/election/ElectionView';
import VotingPage from './pages/voting/VotingPage';
//import VotingPage from './pages/VotingPage';

// Election View Page
//import ElectionView from './pages/ElectionView';

export default function App() {
  const auth = useAuth();
  useUserData();

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
        
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payment/stripe" element={<StripePaymentPage />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
        {/* PUBLIC ROUTES */}
        {PUBLIC_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* VOTING PAGE - Public shareable route */}
        <Route path="/vote/:slug" element={<VotingPage />} />

        {/* ELECTION VIEW ROUTE - Protected */}
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

        {/* ADMIN ROUTES */}
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







//last workable code
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
//          <Route path="/payment/paddle" element={<PaddlePaymentPage />} />
     
//         {/* PUBLIC ROUTES */}
//         {PUBLIC_ROUTES.map((route) => (
//           <Route
//             key={route.path}
//             path={route.path}
//             element={route.element}
//           />
//         ))}

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




