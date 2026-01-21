import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logout } from '../../redux/slices/authSlice';
import LanguageSelector from '../Common/LanguageSelector';
//port LanguageSelector from '../common/LanguageSelector';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, forceUpdate] = useState();

  // Force re-render on language change
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('🔄 Navbar re-rendering for language:', i18n.language);
      forceUpdate({});
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth', { replace: true });
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            {/* ✅ CHANGED: Using logo from public folder */}
            <img 
              src="/logo/logo.png" 
              alt="Vottery Logo" 
              className="w-10 h-10 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Vottery</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {t('nav.home')}
            </Link>
            <Link to="/pricing" className={`text-sm font-medium transition-colors ${location.pathname === '/pricing' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {t('nav.pricing')}
            </Link>
            <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {t('nav.about')}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <button onClick={handleAuthAction} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
              {isAuthenticated ? t('common.logoutAndStartAgain') : t('common.getStarted')}
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              {t('nav.home')}
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/pricing' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              {t('nav.pricing')}
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/about' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              {t('nav.about')}
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="px-4"><LanguageSelector /></div>
              <button onClick={() => { handleAuthAction(); setMobileMenuOpen(false); }} className="w-full px-6 py-2.5 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
                {isAuthenticated ? t('common.logoutAndStartAgain') : t('common.getStarted')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
//last working code only to set logo above code
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { Menu, X } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { logout } from '../../redux/slices/authSlice';
// import LanguageSelector from '../Common/LanguageSelector';
// //port LanguageSelector from '../common/LanguageSelector';

// const Navbar = () => {
//   const { t, i18n } = useTranslation();

//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [, forceUpdate] = useState();

//   // Force re-render on language change
//   useEffect(() => {
//     const handleLanguageChange = () => {
//       console.log('🔄 Navbar re-rendering for language:', i18n.language);
//       forceUpdate({});
//     };
    
//     i18n.on('languageChanged', handleLanguageChange);
    
//     return () => {
//       i18n.off('languageChanged', handleLanguageChange);
//     };
//   }, [i18n]);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleAuthAction = () => {
//     if (isAuthenticated) {
//       handleLogout();
//     } else {
//       navigate('/auth');
//     }
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
//               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <span className="text-xl font-bold text-gray-900">Vottery</span>
//           </Link>

//           <div className="hidden md:flex items-center gap-8">
//             <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
//               {t('nav.home')}
//             </Link>
//             <Link to="/pricing" className={`text-sm font-medium transition-colors ${location.pathname === '/pricing' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
//               {t('nav.pricing')}
//             </Link>
//             <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
//               {t('nav.about')}
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center gap-4">
//             <LanguageSelector />
//             <button onClick={handleAuthAction} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
//               {isAuthenticated ? t('common.logoutAndStartAgain') : t('common.getStarted')}
//             </button>
//           </div>

//           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900">
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {mobileMenuOpen && (
//         <div className="md:hidden bg-white border-t border-gray-200">
//           <div className="px-4 py-4 space-y-3">
//             <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
//               {t('nav.home')}
//             </Link>
//             <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/pricing' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
//               {t('nav.pricing')}
//             </Link>
//             <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/about' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
//               {t('nav.about')}
//             </Link>
//             <div className="pt-4 border-t border-gray-200 space-y-3">
//               <div className="px-4"><LanguageSelector /></div>
//               <button onClick={() => { handleAuthAction(); setMobileMenuOpen(false); }} className="w-full px-6 py-2.5 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
//                 {isAuthenticated ? t('common.logoutAndStartAgain') : t('common.getStarted')}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
//last working code only to support 70+ language above code
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { Menu, X } from 'lucide-react';
// import { logout } from '../../redux/slices/authSlice';
// //import { logout } from '../store/slices/authSlice';

// const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navLinks = [
//     { name: 'Home', path: '/' },
//     { name: 'Pricing', path: '/pricing' },
//     { name: 'About Us', path: '/about' },
//   ];

//   const isActive = (path) => location.pathname === path;

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/auth', { replace: true });
//   };

//   const handleAuthAction = () => {
//     if (isAuthenticated) {
//       handleLogout();
//     } else {
//       navigate('/auth');
//     }
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-2">
//             <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
//               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <span className="text-xl font-bold text-gray-900">Vottery</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center gap-8">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className={`text-sm font-medium transition-colors ${
//                   isActive(link.path)
//                     ? 'text-indigo-600'
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 {link.name}
//               </Link>
//             ))}
//           </div>

//           {/* Desktop CTA */}
//           <div className="hidden md:flex items-center gap-4">
//             <button
//               onClick={handleAuthAction}
//               className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
//             >
//               {isAuthenticated ? 'Logout & Start Again' : 'Get Started'}
//             </button>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 text-gray-600 hover:text-gray-900"
//           >
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden bg-white border-t border-gray-200">
//           <div className="px-4 py-4 space-y-3">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 onClick={() => setMobileMenuOpen(false)}
//                 className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${
//                   isActive(link.path)
//                     ? 'bg-indigo-50 text-indigo-600'
//                     : 'text-gray-600 hover:bg-gray-50'
//                 }`}
//               >
//                 {link.name}
//               </Link>
//             ))}
//             <div className="pt-4 border-t border-gray-200 space-y-3">
//               <button
//                 onClick={() => {
//                   handleAuthAction();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full px-6 py-2.5 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
//               >
//                 {isAuthenticated ? 'Logout & Start Again' : 'Get Started'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
