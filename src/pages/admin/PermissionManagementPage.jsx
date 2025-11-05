import React from 'react';
import PermissionManagement from '../../components/Dashboard/Tabs/roles/PermissionManagement';
//import PermissionManagement from '../../components/Dashboard/Tabs/PermissionManagement';

export default function PermissionManagementPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navbar */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-2xl font-bold text-blue-600">
              Vottery
            </a>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-semibold text-gray-700">Permission Management</h1>
          </div>
          <div className="flex gap-4 items-center">
            <a
              href="/dashboard"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <PermissionManagement />
      </div>
    </div>
  );
}
