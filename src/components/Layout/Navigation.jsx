import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
//import { getNavRoutes } from '../../routes';
import {
  Home,
  User,
  CreditCard,
  History,
  Settings,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';
import { getNavRoutes } from '../routes';

const iconMap = {
  Home: Home,
  User: User,
  CreditCard: CreditCard,
  History: History,
  Settings: Settings,
  BarChart3: BarChart3,
  Users: Users,
  Zap: Zap,
};

const Navigation = ({ sidebarOpen, isAdmin }) => {
  const location = useLocation();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const navRoutes = getNavRoutes(userRole);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex-1 px-2 py-4 space-y-2">
      {navRoutes.map((route) => {
        const Icon = iconMap[route.icon] || Home;
        
        return (
          <Link
            key={route.path}
            to={route.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(route.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={!sidebarOpen ? route.label : ''}
          >
            <Icon size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">{route.label}</span>}
          </Link>
        );
      })}

      {/* Admin Section */}
      {isAdmin && userRole === 'manager' && (
        <>
          <div className={`mt-6 pt-4 border-t border-gray-700 ${!sidebarOpen && 'border-0'}`}>
            {sidebarOpen && <p className="text-xs text-gray-400 px-3 font-semibold uppercase">Admin</p>}
          </div>

          <Link
            to="/admin/subscription"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/admin/subscription')
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={!sidebarOpen ? 'Subscription Admin' : ''}
          >
            <Zap size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Subscription</span>}
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/admin/users')
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={!sidebarOpen ? 'User Management' : ''}
          >
            <Users size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Users</span>}
          </Link>

          <Link
            to="/admin/analytics"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/admin/analytics')
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={!sidebarOpen ? 'Analytics' : ''}
          >
            <BarChart3 size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Analytics</span>}
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navigation;