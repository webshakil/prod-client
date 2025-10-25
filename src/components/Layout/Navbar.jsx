import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Vottery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleAuthAction}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={() => {
                  handleAuthAction();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Menu, X } from 'lucide-react';

// const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navLinks = [
//     { name: 'Home', path: '/' },
//     { name: 'Pricing', path: '/pricing' },
//     { name: 'About Us', path: '/about' },
//   ];

//   const isActive = (path) => location.pathname === path;

//   const handleAuthAction = () => {
//     if (isAuthenticated) {
//       navigate('/dashboard');
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
//             {!isAuthenticated && (
//               <button
//                 onClick={() => navigate('/auth')}
//                 className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
//               >
//                 Sign In
//               </button>
//             )}
//             <button
//               onClick={handleAuthAction}
//               className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
//             >
//               {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
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
//               {!isAuthenticated && (
//                 <button
//                   onClick={() => {
//                     navigate('/auth');
//                     setMobileMenuOpen(false);
//                   }}
//                   className="w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
//                 >
//                   Sign In
//                 </button>
//               )}
//               <button
//                 onClick={() => {
//                   handleAuthAction();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
//               >
//                 {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;