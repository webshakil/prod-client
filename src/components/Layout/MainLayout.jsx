import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Navigation from './Navigation';

const MainLayout = ({ children, isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const auth = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Vottery</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <Navigation sidebarOpen={sidebarOpen} isAdmin={isAdmin} />

        {/* Footer - User Info & Logout */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              {auth.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{auth.user?.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{auth.user?.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;